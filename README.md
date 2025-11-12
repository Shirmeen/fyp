# 🧠 ADetectPro: Early Alzheimer's Disease Detection Using Bayesian Graph Neural Networks

<div align="center">

**A Research-Grade AI System for Early Detection of Alzheimer's Disease from MRI Brain Scans**

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.8-EE4C2C.svg)](https://pytorch.org/)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Motivation](#-motivation)
- [Key Features](#-key-features)
- [Methodology](#-methodology)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Dataset](#-dataset)
- [Evaluation Metrics](#-evaluation-metrics)
- [Project Structure](#-project-structure)
- [Future Work](#-future-work)
- [Credits](#-credits)

---

## 🎯 Overview

**ADetectPro** is an advanced full-stack web application that leverages **Bayesian Graph Neural Networks (BGNN)** for early detection and classification of Alzheimer's disease from structural MRI brain scans. The system provides a user-friendly interface for medical professionals to upload MRI images and receive AI-powered predictions with uncertainty quantification, enabling more informed clinical decision-making.

### Key Capabilities

- **Multi-Class Classification**: Distinguishes between Alzheimer's Disease (AD), Cognitively Normal (CN), and Mild Cognitive Impairment (MCI)
- **Uncertainty Quantification**: Employs Monte Carlo Dropout for reliable confidence estimation
- **Graph-Based Analysis**: Converts MRI images into graph representations to capture spatial relationships
- **Real-Time Processing**: Fast inference pipeline for clinical workflow integration

---

## 💡 Motivation

Alzheimer's disease affects millions worldwide, with early detection being crucial for effective intervention. Traditional diagnostic methods are time-consuming and often rely on subjective assessments. **ADetectPro** addresses these challenges by:

- **Enabling Early Detection**: Identifying disease markers before severe symptoms manifest
- **Reducing Diagnostic Time**: Providing rapid, automated analysis of MRI scans
- **Improving Accuracy**: Leveraging deep learning to identify subtle patterns in brain structure
- **Supporting Clinical Decision-Making**: Offering uncertainty estimates to help clinicians assess prediction reliability

---

## ✨ Key Features

### 🔐 User Management
- Secure user authentication (Login/Signup)
- Session management and user-specific data storage
- SQLite database for persistent user records

### 🖼️ Image Processing Pipeline
- **K-Means Segmentation**: Automatic brain tissue segmentation
- **Graph Construction**: Conversion of segmented images to graph structures using SLIC superpixels
- **Feature Extraction**: RGB-based node features representing brain regions

### 🤖 AI-Powered Detection
- **BGNN Classification**: Bayesian Graph Neural Network with SAGEConv layers
- **Uncertainty Estimation**: Monte Carlo Dropout (20 samples) for prediction confidence
- **Multi-Class Output**: Probability distributions across AD, CN, and MCI classes

### 📊 Visualization & Results
- Interactive probability graphs showing class predictions
- Uncertainty metrics for each prediction
- Visual representation of classification confidence
- Uploaded image preview and processing status

---

## 🔬 Methodology

### Bayesian Graph Neural Network (BGNN)

The core of ADetectPro utilizes a **Bipartite Graph Neural Network** architecture:

#### Architecture Components

1. **Graph Construction**
   - **Image Segmentation**: K-Means clustering (k=3) for brain tissue segmentation
   - **Superpixel Generation**: SLIC algorithm (10,000 segments) for region extraction
   - **Graph Building**: Region Adjacency Graph (RAG) with mean color distance weights
   - **Node Features**: RGB mean values for each superpixel region

2. **Neural Network Architecture**
   ```
   Input Layer: 3D RGB features
   ↓
   SAGEConv Layer 1: 3 → 128 (with ReLU activation)
   ↓
   Dropout Layer (p=0.2)
   ↓
   SAGEConv Layer 2: 128 → 128 (with ReLU activation)
   ↓
   Dropout Layer (p=0.2)
   ↓
   Global Mean Pooling
   ↓
   Fully Connected Layer: 128 → 3
   ↓
   Output: Log Softmax (AD, CN, MCI)
   ```

3. **Uncertainty Quantification**
   - **Monte Carlo Dropout**: 20 forward passes with dropout enabled
   - **Mean Prediction**: Average of all MC samples
   - **Uncertainty Metric**: Variance across MC samples
   - **Confidence Score**: Inverse of uncertainty for reliability assessment

### Preprocessing Pipeline

1. **Image Loading**: Grayscale MRI scan input
2. **Background Removal**: Threshold-based filtering (intensity > 10)
3. **Normalization**: Pixel values normalized to [0, 1]
4. **K-Means Clustering**: 3-cluster segmentation for brain tissue classification
5. **SLIC Segmentation**: Superpixel generation for graph nodes
6. **RAG Construction**: Edge creation based on spatial adjacency and color similarity
7. **Graph Feature Extraction**: RGB statistics for each node

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (TypeScript)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Home Page   │  │  Login/Signup │  │  Detection   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTP/REST API
┌───────────────────────────▼─────────────────────────────────┐
│              Flask Backend (Python)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Image Upload & Processing Endpoint                  │   │
│  │  - Receive MRI image                                 │   │
│  │  - Trigger graph processing pipeline                 │   │
│  │  - Return predictions with uncertainty               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Graph Processing Module                            │   │
│  │  - K-Means segmentation                              │   │
│  │  - SLIC superpixel generation                        │   │
│  │  - Graph construction (nodes & edges)               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  BGNN Model Inference                                │   │
│  │  - Load trained model (bgnn_model.pth)              │   │
│  │  - Monte Carlo Dropout inference                      │   │
│  │  - Uncertainty quantification                        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  SQLite Database                                     │   │
│  │  - User authentication                               │   │
│  │  - Image metadata storage                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend
- **Flask 3.1.2**: RESTful API framework
- **PyTorch 2.8.0**: Deep learning framework
- **PyTorch Geometric 2.6.1**: Graph neural network operations
- **OpenCV 4.12.0**: Image processing and computer vision
- **scikit-learn 1.7.2**: Machine learning utilities (K-Means, preprocessing)
- **scikit-image 0.25.2**: Image segmentation (SLIC, RAG)
- **NumPy 2.2.6**: Numerical computations
- **Pandas 2.3.3**: Data manipulation
- **SQLite3**: Lightweight database for user management

### Frontend
- **React 18.3.1**: UI framework
- **TypeScript 5.6.2**: Type-safe JavaScript
- **Vite 6.0.5**: Build tool and dev server
- **React Router DOM 6.29.0**: Client-side routing
- **Axios 1.8.2**: HTTP client for API communication
- **CSS3**: Modern styling with gradients and animations

### Development Tools
- **ESLint**: Code quality and linting
- **TypeScript Compiler**: Type checking
- **Virtual Environment**: Python dependency isolation

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Git** (for cloning the repository)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd fyp
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On Windows (CMD):
venv\Scripts\activate.bat
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install Node.js dependencies
npm install
```

### Step 4: Verify Model Files

Ensure the trained BGNN model file is present:
- `backend/bgnn_model (2).pth` (or `bgnn_model (4).pth`)

---

## 🚀 Usage Guide

### Starting the Application

#### Terminal 1: Start Backend Server

```bash
cd backend
.\venv\Scripts\Activate.ps1  # Activate virtual environment
python app.py
```

The Flask API will start on `http://127.0.0.1:5000`

#### Terminal 2: Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The React application will start on `http://localhost:5173`

### Using the Application

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - You'll see the ADetectPro homepage

2. **User Registration/Login**
   - Click "Signup" to create a new account
   - Or click "Login" if you already have an account
   - Enter your email and password

3. **Upload MRI Scan**
   - Navigate to the Alzheimer Detection page
   - Click "Upload MRI Image" button
   - Select a brain MRI scan image (JPG, PNG formats supported)

4. **View Results**
   - Wait for processing (typically 10-30 seconds)
   - View the predicted class: **AD**, **CN**, or **MCI**
   - Examine the probability graph showing confidence scores
   - Review uncertainty metrics for prediction reliability

5. **Interpret Results**
   - **High Probability + Low Uncertainty**: Reliable prediction
   - **Low Probability or High Uncertainty**: Consider additional diagnostic tests

---

## 📊 Dataset

### ADNI (Alzheimer's Disease Neuroimaging Initiative)

The model was trained on data from the **Alzheimer's Disease Neuroimaging Initiative (ADNI)**, a comprehensive dataset containing:

- **Structural MRI Scans**: T1-weighted brain images
- **Clinical Classifications**: Expert-annotated labels (AD, CN, MCI)
- **Demographic Information**: Age, gender, and other clinical variables
- **Longitudinal Data**: Multiple scans per patient over time

### Data Preprocessing

- **Image Normalization**: Intensity normalization and background removal
- **Segmentation**: K-Means clustering for brain tissue extraction
- **Graph Construction**: Conversion to graph format with spatial relationships
- **Train/Validation Split**: Stratified split maintaining class distribution

---

## 📈 Evaluation Metrics

The BGNN model performance is evaluated using standard classification metrics:

- **Accuracy**: Overall classification correctness
- **Precision**: Per-class precision scores
- **Recall**: Sensitivity for each class
- **F1-Score**: Harmonic mean of precision and recall
- **Confusion Matrix**: Detailed class-wise performance
- **Uncertainty Calibration**: Correlation between uncertainty and prediction errors

### Model Performance Highlights

- **Multi-Class Classification**: Effective discrimination between AD, CN, and MCI
- **Uncertainty Quantification**: Reliable confidence estimation through MC Dropout
- **Robustness**: Consistent performance across different MRI scan qualities

---

## 📁 Project Structure

```
fyp/
├── backend/                      # Flask API Server
│   ├── app.py                   # Main Flask application & API endpoints
│   ├── graph_processing.py      # Graph construction & BGNN model
│   ├── requirements.txt         # Python dependencies
│   ├── myapp.db                 # SQLite database
│   ├── bgnn_model (2).pth      # Trained BGNN model weights
│   ├── bgnn_model (4).pth      # Alternative model checkpoint
│   ├── venv/                    # Python virtual environment
│   └── graph_output_single/     # Temporary graph processing outputs
│
├── frontend/                    # React TypeScript Frontend
│   ├── src/
│   │   ├── App.tsx              # Main React component & routing
│   │   ├── main.tsx             # React entry point
│   │   ├── login.tsx            # Login page component
│   │   ├── signup.tsx           # Signup page component
│   │   ├── DatabaseVersion.jsx  # Database management component
│   │   ├── componenets/
│   │   │   └── HomePage.jsx     # Landing page component
│   │   ├── assets/              # Static assets (images, icons)
│   │   ├── App.css              # Component styles
│   │   └── index.css            # Global styles
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.ts          # Vite configuration
│   ├── tsconfig.json           # TypeScript configuration
│   └── index.html              # HTML entry point
│
└── README.md                    # This file
```

---

## 🔮 Future Work

### Model Improvements
- **Transfer Learning**: Fine-tune on larger, more diverse datasets
- **Ensemble Methods**: Combine multiple BGNN models for improved accuracy
- **Attention Mechanisms**: Incorporate attention layers for better feature learning
- **Multi-Modal Fusion**: Integrate additional imaging modalities (PET, DTI)

### System Enhancements
- **Real-Time Processing**: Optimize pipeline for faster inference
- **Batch Processing**: Support multiple image uploads simultaneously
- **Cloud Deployment**: Deploy to cloud infrastructure for scalability
- **Mobile Application**: Develop mobile app for point-of-care usage

### Clinical Integration
- **DICOM Support**: Direct integration with medical imaging systems
- **PACS Integration**: Connect with Picture Archiving and Communication Systems
- **Clinical Reports**: Generate detailed diagnostic reports
- **Longitudinal Tracking**: Monitor disease progression over time

### Research Directions
- **Explainability**: Add model interpretability features (Grad-CAM, attention maps)
- **Active Learning**: Implement active learning for continuous model improvement
- **Federated Learning**: Enable privacy-preserving multi-institutional training
- **Prognostic Modeling**: Predict disease progression and treatment response

---

## 👥 Credits

### Authors
- **Student Name** - Final Year Project Developer
  - Implementation, Model Development, System Architecture

### Academic Supervision
- **Supervisor Name** - [University/Department]
  - Research Guidance, Methodology Review, Technical Oversight

### Institution
- **University Name**
- **Department of [Department Name]**
- **Academic Year: [Year]**

### Acknowledgments
- **ADNI** (Alzheimer's Disease Neuroimaging Initiative) for providing the dataset
- **PyTorch Geometric** team for excellent graph neural network tools
- **Open Source Community** for the amazing libraries and frameworks

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📧 Contact

For questions, suggestions, or collaboration opportunities, please contact:

- **Email**: [your-email@university.edu]
- **GitHub**: [your-github-username]

---

<div align="center">

**Built with ❤️ for Early Alzheimer's Disease Detection**

*Advancing Healthcare Through AI-Powered Medical Imaging*

</div>
