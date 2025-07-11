from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import uuid
import torch
from torchvision import transforms
from PIL import Image
from graph_processing import process_single_image
#import plotly.graph_objects as go
import numpy as np
import sqlite3
import pandas as pd
from torch.nn import Dropout
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv, global_mean_pool
from torch_geometric.data import Data
import matplotlib.pyplot as plt

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

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def get_db_connection():
    conn = sqlite3.connect('myapp.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS UserImages (
            image_id TEXT PRIMARY KEY,
            user_id INTEGER,
            image_path TEXT,
            FOREIGN KEY (user_id) REFERENCES Users(id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

MODEL_PATH = os.path.join('C:/Users/shirm/my-app/src', 'bgnn_model (2).pth')
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def load_model():
    try:
        checkpoint = torch.load(MODEL_PATH, map_location=device, weights_only=False)
        if "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        else:
            state_dict = checkpoint
        model = BGNNClassifier(input_dim=3, hidden_dim=128, output_dim=3)
        model.load_state_dict(state_dict, strict=False)
        model.eval()
        return model
    except FileNotFoundError:
        print(f"Error: Model file not found at {MODEL_PATH}")
        exit(1)
    except Exception as e:
        print(f"Error loading model: {e}")
        exit(1)

model = load_model()

@app.route('/upload', methods=['POST'])
def upload_image():
    print("Received upload request")
    if 'image' not in request.files:
        print("No image file provided")
        return jsonify({"message": "No image file provided"}), 400

    image = request.files['image']
    if image.filename == '':
        print("No selected file")
        return jsonify({"message": "No selected file"}), 400

    print(f"Received image: {image.filename}")

    if not os.path.exists('uploads'):
        os.makedirs('uploads')

    unique_filename = str(uuid.uuid4()) + '.jpg'
    image_path = os.path.join('uploads', unique_filename)
    image.save(image_path)

    try:
        print("Processing image for segmentation and CSV generation...")
        node_csv, edge_csv = process_single_image(image_path)

        print("Loading graph data...")
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

        dummy_label = torch.tensor([0], dtype=torch.long)
        graph = Data(x=node_features, edge_index=edge_index, edge_attr=edge_weight, y=dummy_label)
        graph.batch = torch.zeros(graph.num_nodes, dtype=torch.long)

        print("Predicting class using the graph...")
        graph = graph.to(device)
        mean_pred, uncertainty = model.predict_with_uncertainty(graph, mc_samples=20)

        predicted_class_idx = mean_pred.argmax(dim=1).item()
        labels = {0: "Alzheimer Disease", 1: "Cognitively Normal", 2: "Mild Cognitive Impairment"}
        result = labels.get(predicted_class_idx, "Unknown")

        # Plot class probabilities using matplotlib and save as PNG
        probs = mean_pred.exp().cpu().numpy().flatten()
        class_labels = list(labels.values())
        plt.figure(figsize=(6, 4))
        plt.bar(range(len(probs)), probs, tick_label=class_labels, color=['lightskyblue' if i != predicted_class_idx else 'orange' for i in range(len(probs))])
        plt.xlabel("Class")
        plt.ylabel("Probability")
        plt.title("Predicted Class Probabilities")
        plt.tight_layout()
        plot_filename = f"{unique_filename}_class_probs.png"
        plot_path = os.path.join('uploads', plot_filename)
        plt.savefig(plot_path)
        plt.close()
        plot_url = f"http://127.0.0.1:5000/uploads/{plot_filename}"

        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            image_id = str(uuid.uuid4())
            cursor.execute("INSERT INTO UserImages (image_id, user_id, image_path) VALUES (?, ?, ?)",
                           (image_id, None, image_path))
            conn.commit()
            print("Image record inserted into the database")
        except Exception as e:
            print(f"Failed to insert image record into the database: {e}")
            return jsonify({"message": "Failed to insert image record into the database"}), 500
        finally:
            conn.close()

        image_url = f"http://127.0.0.1:5000/uploads/{unique_filename}"
        return jsonify({
            "message": "Image uploaded and processed successfully",
            "result": result,
            "uncertainty": uncertainty.mean().item(),
            "image_url": image_url,
            "plot_url": plot_url,
            "image_id": image_id
        }), 200

    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({"message": "Error processing image", "error": str(e)}), 500

@app.route('/process-image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({"message": "No image file provided"}), 400

    image = request.files['image']
    if image.filename == '':
        return jsonify({"message": "No selected file"}), 400

    # Save the uploaded image
    image_path = os.path.join('uploads', image.filename)
    image.save(image_path)

    try:
        # Process the image and generate graph CSVs
        node_csv, edge_csv = process_single_image(image_path)

        # Predict the class using the graph
        predicted_class, uncertainty = predict_graph(node_csv, edge_csv)

        return jsonify({
            "message": "Image processed successfully",
            "predicted_class": predicted_class,
            "uncertainty": uncertainty
        }), 200
    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({"message": "Error processing image", "error": str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM Users WHERE email = ? AND password = ?", (email, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({"message": "Login successful", "user_id": user["id"]}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM Users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if user:
        conn.close()
        return jsonify({"message": "User already exists"}), 409

    cursor.execute("INSERT INTO Users (email, password) VALUES (?, ?)", (email, password))
    conn.commit()
    cursor.execute("SELECT id FROM Users WHERE email = ?", (email,))
    new_user = cursor.fetchone()
    conn.close()

    return jsonify({"message": "Signup successful", "user_id": new_user["id"]}), 201

if __name__ == '__main__':
    app.run(debug=True)