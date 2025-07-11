import os
import cv2
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans  # <-- Fix the import here
from skimage.graph import rag_mean_color
from skimage.measure import regionprops
from skimage import io, color
import matplotlib.pyplot as plt
from skimage.segmentation import slic
import torch
from torch.nn import functional as F
from torch.nn import Dropout
from torch_geometric.data import Data, Dataset, DataLoader
from torch_geometric.nn import SAGEConv, global_mean_pool
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import matplotlib
matplotlib.use('Agg')

class BGNNClassifier(torch.nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim, dropout_prob=0.2):
        super(BGNNClassifier, self).__init__()
        self.conv1 = SAGEConv(input_dim, hidden_dim)
        self.conv2 = SAGEConv(hidden_dim, hidden_dim)
        self.fc = torch.nn.Linear(hidden_dim, output_dim)
        self.dropout = Dropout(p=dropout_prob)

    def forward(self, data, mc_dropout=False):
        x, edge_index, batch = data.x, data.edge_index, data.batch
        x = F.relu(self.conv1(x, edge_index))
        if mc_dropout:
            x = self.dropout(x)
        x = F.relu(self.conv2(x, edge_index))
        if mc_dropout:
            x = self.dropout(x)
        x = global_mean_pool(x, batch)
        x = self.fc(x)
        return F.log_softmax(x, dim=-1)

    def predict_with_uncertainty(self, data, mc_samples=20):
        self.train()
        predictions = []
        with torch.no_grad():
            for _ in range(mc_samples):
                out = self.forward(data, mc_dropout=True)
                predictions.append(out.unsqueeze(0))
        predictions = torch.cat(predictions, dim=0)
        mean = predictions.mean(dim=0)
        uncertainty = predictions.var(dim=0)
        return mean, uncertainty
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = BGNNClassifier(input_dim=3, hidden_dim=128, output_dim=3)
# model.load_state_dict(torch.load(model_path, map_location=device))
# === Configuration ===
output_dir = 'C:/Users/shirm/my-app/src/graph_output_single'
os.makedirs(output_dir, exist_ok=True)

def segment_image(image_path, output_dir):
    """Segment the input image using KMeans and save both the label map and a visualization."""
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
    segmented[non_background_mask] = kmeans.labels_ + 1  # Avoid 0 for background

    # Save label map
    basename = os.path.splitext(os.path.basename(image_path))[0]
    label_map_path = os.path.join(output_dir, f"{basename}_kmeans_labels.npy")
    np.save(label_map_path, segmented)

    # Color map for visualization
    color_map = {
        0: [0, 0, 0],
        1: [0, 255, 0],
        2: [255, 255, 0],
        3: [139, 69, 19],
    }

    segmentation_mask = np.zeros((*segmented.shape, 3), dtype=np.uint8)
    for cluster_id, color_val in color_map.items():
        segmentation_mask[segmented == cluster_id] = color_val

    segmented_image_path = os.path.join(output_dir, f"{basename}_segmented_image.jpg")
    if not cv2.imwrite(segmented_image_path, segmentation_mask):
        raise IOError(f"Failed to save segmented image at {segmented_image_path}")

    print(f"Segmented image and label map saved at: {segmented_image_path}, {label_map_path}")
    return segmented_image_path, label_map_path

def process_single_image(image_path):
    """Generate graph data using the KMeans label map."""
     # Step 1: Segment Image with KMeans
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

    segmented_image_path = os.path.join(output_dir, "segmented_image.jpg")
    cv2.imwrite(segmented_image_path, segmentation_mask)

    # Step 2: Process Image and Create Graph
    image = io.imread(segmented_image_path)
    if image.ndim == 2:
        image = color.gray2rgb(image)

    segments = slic(image, n_segments=10000, compactness=10, start_label=0)

    valid_labels = set(
        region.label for region in regionprops(segments)
        if np.mean(image[segments == region.label]) > 5
    )
    valid_mask = np.isin(segments, list(valid_labels))

    rag = rag_mean_color(image, segments, mode="distance")
    filtered_edges = [
        (int(e[0]), int(e[1]), rag.edges[e]["weight"])
        for e in rag.edges
        if e[0] in valid_labels and e[1] in valid_labels
    ]

    node_features = []
    for label in valid_labels:
        mask = (segments == label)
        region = image[mask]
        mean_color = np.mean(region, axis=0)
        node_features.append([label] + mean_color.tolist())

    basename = os.path.splitext(os.path.basename(image_path))[0]
    node_df = pd.DataFrame(node_features, columns=["node", "R", "G", "B"])
    edge_df = pd.DataFrame(filtered_edges, columns=["source", "target", "weight"])

    node_csv_path = os.path.join(output_dir, f"{basename}_nodes.csv")
    edge_csv_path = os.path.join(output_dir, f"{basename}_edges.csv")

    node_df.to_csv(node_csv_path, index=False)
    edge_df.to_csv(edge_csv_path, index=False)

    # Step 3: Predict with BGNN
    edge_df = pd.read_csv(edge_csv_path)
    node_df = pd.read_csv(node_csv_path)

    node_features = torch.tensor(node_df[["R", "G", "B"]].values, dtype=torch.float)
    node_map = {nid: i for i, nid in enumerate(node_df["node"].tolist())}

    edge_df = edge_df[edge_df["source"].isin(node_map) & edge_df["target"].isin(node_map)]
    edge_index = torch.tensor(
        [[node_map[src], node_map[tgt]] for src, tgt in zip(edge_df["source"], edge_df["target"])],
        dtype=torch.long
    ).t().contiguous()
    edge_weight = torch.tensor(edge_df["weight"].values, dtype=torch.float)

    dummy_label = torch.tensor([0], dtype=torch.long)

    graph = Data(x=node_features, edge_index=edge_index, edge_attr=edge_weight, y=dummy_label)
    graph.batch = torch.zeros(graph.num_nodes, dtype=torch.long)

    graph = graph.to(device)
    mean_pred, uncertainty = model.predict_with_uncertainty(graph, mc_samples=20)

    predicted_class_idx = mean_pred.argmax(dim=1).item()
    predicted_class = ["AD", "CN", "MCI"][predicted_class_idx]

    return node_csv_path, edge_csv_path
