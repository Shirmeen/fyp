import React from 'react';
import { useNavigate } from 'react-router-dom';
// import backgroundImage from './giphy1.gif'; // Import the image

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <h1 style={styles.navbarBrand}>ADetectPro</h1>
        <div style={styles.navbarLinks}>
          <button onClick={handleLoginClick} style={styles.navbarButton}>Login</button>
          <button onClick={handleSignupClick} style={styles.navbarButton}>Signup</button>
        </div>
      </nav>
      <div style={styles.mainContent}>
        <div style={styles.imageContainer}></div>
        <div style={styles.contentContainer}>
          <div style={styles.content}>
            <h1 style={styles.heading}>Welcome to ADetectPro</h1>
            <p style={styles.description}>
            Welcome to ADetectPro – Advancing Alzheimer's Detection with AI-Powered Precision
            </p>
            <div style={styles.buttonContainer}>
              <button onClick={handleLoginClick} style={styles.button}>Login</button>
              <button onClick={handleSignupClick} style={styles.button}>Signup</button>
            </div>
          </div>
          <footer style={styles.footer}>
            <p style={styles.footerText}>© 2025 ADetectPro. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px', // Adjust padding for better spacing
    backgroundColor: '#ffc0cb', // Change background color to light pink
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    position: 'sticky', // Make the navbar sticky
    top: 0,
    zIndex: 1000,
  },
  navbarBrand: {
    color: '#fff', // Change text color to white for better contrast
    fontSize: '1.5rem',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '700',
  },
  navbarLinks: {
    display: 'flex',
    gap: '15px', // Adjust gap between buttons
  },
  navbarButton: {
    background: 'linear-gradient(135deg, #9370db, #7b68ee)', // Revert button color to purple gradient
    color: '#fff',
    padding: '8px 16px', // Adjust padding for smaller buttons
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '20px', // Adjust border radius for a pill shape
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'inline-block',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    letterSpacing: '1px',
    border: 'none',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: 'contain', // Adjust to contain the image within the container
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat', // Prevent the image from repeating
    height: '600px', // Set a fixed height for the container
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    textAlign: 'center',
    padding: '20px',
  },
  heading: {
    background: 'linear-gradient(135deg, #9370db, #7b68ee)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '4rem',
    marginBottom: '20px',
    fontFamily: "'Roboto', sans-serif", // Change the font family here
    fontWeight: '700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
    letterSpacing: '1.5px',
    padding: '10px 0',
  },
  description: {
    color: '#4b0082',
    fontSize: '1.2rem',
    marginBottom: '30px',
    maxWidth: '600px',
    margin: '0 auto 30px',
    lineHeight: '1.6',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  button: {
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
    border: 'none',
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: '10px',
    textAlign: 'center',
    boxShadow: '0 -4px 8px rgba(0, 0, 0, 0.1)',
  },
  footerText: {
    color: '#4b0082',
    fontSize: '1rem',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '600',
  },
};

export default HomePage;