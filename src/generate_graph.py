import os
import torch
import pandas as pd
import numpy as np
import cv2
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from skimage.segmentation import slic
from skimage.graph import rag_mean_color
from skimage.measure import regionprops
from skimage import io, color
from torch_geometric.data import Data
from torch.nn.functional import softmax

# Define the BGNNClassifier class
class BGNNClassifier(torch.nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim, dropout_prob=20):
        super(BGNNClassifier, self).__init__()
        self.conv1 = SAGEConv(input_dim, hidden_dim)
        self.conv2 = SAGEConv(hidden_dim, hidden_dim)
        self.fc = torch.nn.Linear(hidden_dim, output_dim)
        self.dropout = torch.nn.Dropout(p=dropout_prob)

    def forward(self, data, mc_dropout=False):
        x, edge_index, batch = data.x, data.edge_index, data.batch
        x = torch.relu(self.conv1(x, edge_index))
        if mc_dropout:
            x = self.dropout(x)
        x = torch.relu(self.conv2(x, edge_index))
        if mc_dropout:
            x = self.dropout(x)
        x = global_mean_pool(x, batch)
        x = self.fc(x)
        return softmax(x, dim=-1)

    def predict_with_uncertainty(self, data, mc_samples=20):
        self.train()  # Enable dropout
        predictions = []
        with torch.no_grad():
            for _ in range(mc_samples):
                out = self.forward(data, mc_dropout=True)
                predictions.append(out.unsqueeze(0))
        predictions = torch.cat(predictions, dim=0)
        mean = predictions.mean(dim=0)
        uncertainty = predictions.var(dim=0)
        return mean, uncertainty

# === Segmentation Part ===
image_path = "path_to_image.jpg"  # Replace with the actual image path
mri_image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
if mri_image is None:
    raise FileNotFoundError(f"Image not found: {image_path}")

background_threshold = 10
non_background_mask = mri_image > background_threshold
normalized_image = mri_image / 255.0
pixels = normalized_image[non_background_mask].reshape(-1, 1)

kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(pixels)

segmented = np.zeros_like(mri_image)
segmented[non_background_mask] = kmeans.labels_ + 1

# Color map for display
color_map = {
    0: [0, 0, 0],
    1: [0, 255, 0],
    2: [255, 255, 0],
    3: [139, 69, 19],
}

segmentation_mask = np.zeros((*segmented.shape, 3), dtype=np.uint8)
for cluster_id, color_val in color_map.items():
    segmentation_mask[segmented == cluster_id] = color_val

# Save the segmented image for visualization
segmented_image_path = "segmented_image.jpg"  # Replace with the desired output path
cv2.imwrite(segmented_image_path, segmentation_mask)

# === Graph Construction ===
node_csv = "path_to_nodes.csv"  # Replace with the actual path
edge_csv = "path_to_edges.csv"  # Replace with the actual path
node_df = pd.read_csv(node_csv)
edge_df = pd.read_csv(edge_csv)

node_features = torch.tensor(node_df[["R", "G", "B"]].values, dtype=torch.float)
node_map = {nid: i for i, nid in enumerate(node_df["node"].tolist())}

edge_df = edge_df[edge_df["source"].isin(node_map) & edge_df["target"].isin(node_map)]
edge_index = torch.tensor(
    [[node_map[src], node_map[tgt]] for src, tgt in zip(edge_df["source"], edge_df["target"])],
    dtype=torch.long
).t().contiguous()
edge_weight = torch.tensor(edge_df["weight"].values, dtype=torch.float)

# Dummy label (not used for prediction)
dummy_label = torch.tensor([0], dtype=torch.long)

# Create Data object
graph = Data(x=node_features, edge_index=edge_index, edge_attr=edge_weight, y=dummy_label)
graph.batch = torch.zeros(graph.num_nodes, dtype=torch.long)

# Load the model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model_path = "path_to_model.pth"  # Replace with the actual path
model = BGNNClassifier(input_dim=3, hidden_dim=128, output_dim=3).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# Predict with uncertainty
graph = graph.to(device)
mean_pred, uncertainty = model.predict_with_uncertainty(graph, mc_samples=20)

# Plot class probabilities
probs = mean_pred.exp().cpu().numpy().flatten()
labels = ["No Alzheimer's", "Mild Alzheimer's", "Severe Alzheimer's"]
plt.bar(labels, probs, color=['blue', 'orange', 'green'])
plt.xlabel("Class")
plt.ylabel("Probability")
plt.title("Predicted Class Probabilities")
plt.show()
