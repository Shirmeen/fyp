import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import backgroundImage from './image22.jpg';
import LoginPage from './login';
import Signup from './signup';
import DatabaseVersion from './DatabaseVersion.jsx';
import HomePage from "./componenets/HomePage.jsx"
const AlzheimerDetectionPage = ({ userId }) => {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [plotUrl, setPlotUrl] = useState<string | null>(null); // Add state for plot URL
  const [message, setMessage] = useState('');

  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file); // Store the file object instead of the data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetect = () => {
    if (!image) {
      setMessage("No image selected");
      return;
    }

    // Comment out userId logic if not using SQL/database
    if (!userId) {
      setMessage("User ID is required");
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    // formData.append('user_id', userId); // Comment out user_id if not needed

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
    axios.post(`${apiBaseUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        console.log(response.data);
        setMessage(response.data.message);
        setResult(`Predicted Class: ${response.data.result}, Uncertainty: ${response.data.uncertainty}`);
        setUploadedImageUrl(null);
        setPlotUrl(response.data.plot_url);
      })
      .catch(error => {
        // Show backend error message if available
        if (error.response && error.response.data && error.response.data.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage('Error processing the image');
        }
        setResult(null);
        setPlotUrl(null);
      });
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>ADetectPro</h1>
      <p style={styles.description}>
        Upload an MRI image to detect signs of Alzheimer's disease.
      </p>

      <div style={styles.imageContainer}></div>

      <div style={styles.uploadSection}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={styles.fileInput}
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          style={styles.uploadLabel}
          onMouseEnter={(e) => e.target.style.transform = styles.uploadLabelHover.transform}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Upload MRI Image
        </label>

        {image && (
          <div style={styles.imagePreview}>
            <img src={URL.createObjectURL(image)} alt="Uploaded MRI" style={styles.image} />
          </div>
        )}
      </div>

      <div style={styles.buttonContainer}>
        <button
          onClick={handleDetect}
          style={styles.button}
          onMouseEnter={(e) => e.target.style.transform = styles.buttonHover.transform}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          Detect Alzheimer's
        </button>
      </div>

      {message && <p style={styles.result}>{message}</p>}
      {result && (
        <div style={styles.resultContainer}>
          <p style={styles.result}>{result}</p>
        </div>
      )}
      {/* Remove uploaded image preview, show graph if available */}
      {plotUrl && (
        <div style={styles.imagePreview}>
          <h2 style={{ backgroundColor: '#f9f9f9'}}>
              <h3>Prediction Graph</h3>
              <img src={plotUrl} alt="Prediction Graph" style={styles.image} />
          </h2>
  
        </div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '150vh',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    padding: '20px',
    textAlign: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  heading: {
    color: '#4b0082',
    fontSize: '3rem',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
    letterSpacing: '1.5px',
    marginBottom: '20px',
  },
  description: {
    color: '#4b0082',
    fontSize: '1.2rem',
    marginBottom: '30px',
    maxWidth: '600px',
    margin: '0 auto 30px',
    lineHeight: '1.6',
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px',
  },
  uploadSection: {
    marginBottom: '30px',
  },
  fileInput: {
    display: 'none',
  },
  uploadLabel: {
    background: 'linear-gradient(135deg, #9370db, #7b68ee)',
    color: '#fff',
    padding: '15px 40px',
    fontSize: '1.2rem',
    fontWeight: '600',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-block',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    letterSpacing: '1px',
    position: 'relative',
    overflow: 'hidden',
    border: '5px solid transparent',
  },
  uploadLabelHover: {
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
  },
  imagePreview: {
    marginTop: '20px',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    backgroundColor: 'white',
  },
  buttonContainer: {
    marginTop: '50px',
  },
  button: {
    background: 'linear-gradient(135deg, #9370db, #7b68ee)',
    color: '#fff',
    padding: '15px 40px',
    fontSize: '1.2rem',
    fontWeight: '600',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-block',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    letterSpacing: '1px',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonHover: {
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
  },
  result: {
    marginTop: '20px',
    color: '#4b0082',
    fontSize: '1.4rem',
    fontWeight: '700',
    textShadow: '2px 1px 2px rgba(0,0,0,0.1)',
    height: '100px',

  },
  resultContainer: {
    marginTop: '30px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    height: '100px',
  },
};

// The SQL Server (mssql) extension for VS Code has successfully installed the SQL tools service.
// You can now use the "MS SQL: Connect" command from the Command Palette (Ctrl+Shift+P) to connect to your SQL Server instance and run queries directly from VS Code.

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(''); // Add state for user ID

  const handleLogin = (user_id: any) => {
    setIsAuthenticated(true);
    setUserId(user_id); // Set the user ID after login
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Show homepage by default */}
        <Route path="/home" element={<HomePage />} /> {/* Homepage route */}
        <Route path="/alzheimer-detection" element={<AlzheimerDetectionPage userId={userId} />} /> {/* Pass userId as a prop */}
        <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} handleLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup setIsAuthenticated={setIsAuthenticated} handleLogin={handleLogin} />} />
        <Route path="/database-version" element={<DatabaseVersion />} />
      </Routes>
    </Router>
  );
};

export default App;