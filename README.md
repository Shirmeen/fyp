# Alzheimer's Disease Detection System

A full-stack application for detecting Alzheimer's disease using MRI brain scans with Graph Neural Networks (BGNN).

## 🏗️ Project Structure

```
fyp/
├── backend/                 # Flask API Server
│   ├── app.py             # Main Flask application
│   ├── graph_processing.py # Graph processing and ML model
│   ├── requirements.txt   # Python dependencies
│   ├── myapp.db          # SQLite database
│   ├── bgnn_model (2).pth # Trained BGNN model
│   ├── bgnn_model (4).pth # Alternative model
│   └── venv/             # Python virtual environment
├── frontend/              # React TypeScript Frontend
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── main.tsx       # React entry point
│   │   ├── login.tsx      # Login component
│   │   ├── signup.tsx     # Signup component
│   │   ├── DatabaseVersion.jsx # Database component
│   │   ├── componenets/
│   │   │   └── HomePage.jsx # Home page component
│   │   ├── assets/        # Static assets
│   │   ├── App.css        # Styles
│   │   └── index.css      # Global styles
│   ├── package.json       # Node.js dependencies
│   ├── vite.config.ts    # Vite configuration
│   └── tsconfig.json      # TypeScript configuration
└── README.md             # This file
```

## 🚀 How to Run

### Prerequisites
- Node.js (for frontend)
- Python 3.x (for backend)
- Virtual environment (already created)

### Backend Setup (Flask API)
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Activate virtual environment
python app.py                # Start Flask server
```
The backend will run on `http://127.0.0.1:5000`

### Frontend Setup (React App)
```bash
cd frontend
npm install                 # Install dependencies
npm run dev                # Start development server
```
The frontend will run on `http://localhost:5173`

## 🔧 Features

- **User Authentication**: Login/Signup system
- **Image Upload**: MRI brain scan upload interface
- **AI Detection**: BGNN-based Alzheimer's disease classification
- **Results Visualization**: Probability graphs and uncertainty estimation
- **Database Storage**: SQLite database for user data and image records

## 🧠 AI Model

- **Algorithm**: Bipartite Graph Neural Network (BGNN)
- **Input**: MRI brain scan images
- **Output**: Classification into:
  - Alzheimer Disease (AD)
  - Cognitively Normal (CN) 
  - Mild Cognitive Impairment (MCI)
- **Features**: Uncertainty estimation with Monte Carlo dropout

## 📊 Classification Results

The system provides:
- Predicted class with confidence scores
- Uncertainty estimation
- Visual probability graphs
- Image processing pipeline with graph generation

## 🛠️ Technology Stack

**Backend:**
- Flask (Python web framework)
- PyTorch (Deep learning)
- OpenCV (Image processing)
- scikit-learn (Machine learning)
- SQLite (Database)

**Frontend:**
- React 18 (UI framework)
- TypeScript (Type safety)
- Vite (Build tool)
- Axios (HTTP client)

## 📝 Usage

1. Start the backend server
2. Start the frontend development server
3. Open `http://localhost:5173` in your browser
4. Upload an MRI brain scan image
5. View the AI prediction results

## 🔬 Research

This project implements a research-grade Alzheimer's detection system using state-of-the-art graph neural network techniques for medical image analysis.