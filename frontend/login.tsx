import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import backgroundImage from './giphy.gif'; // Import the background image

const LoginPage = ({ setIsAuthenticated, handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    axios.post('http://127.0.0.1:5000/login', { email, password })
      .then(response => {
        console.log(response.data);
        setMessage(response.data.message);
        if (response.data.user_id) {
          handleLogin(response.data.user_id); // Set the user ID after login
          navigate('/alzheimer-detection');
        }
      })
      .catch(error => {
        console.error('There was an error logging in!', error);
        setMessage('Invalid email or password');
      });
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Login</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.rememberMeContainer}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={styles.checkbox}
            />
            <label style={styles.rememberMeLabel}>Remember Me</label>
          </div>
          <button type="submit" style={styles.button}>Login</button>
          <div style={styles.forgotPasswordContainer}>
            <a href="/forgot-password" style={styles.forgotPasswordLink}>Forgot Password?</a>
          </div>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  heading: {
    color: '#4b0082',
    fontSize: '2.5rem',
    marginBottom: '20px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '700',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
    letterSpacing: '1.5px',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontSize: '1rem',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  },
  rememberMeContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  checkbox: {
    marginRight: '10px',
  },
  rememberMeLabel: {
    color: '#333',
    fontSize: '1rem',
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
    width: '100%',
  },
  forgotPasswordContainer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  forgotPasswordLink: {
    color: '#9370db',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '600',
  },
};

export default LoginPage;