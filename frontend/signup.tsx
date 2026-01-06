import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from './src/config';

interface SignupProps {
  setIsAuthenticated: (auth: boolean) => void;
  handleLogin: (userId: string) => void;
}

const Signup: React.FC<SignupProps> = ({ setIsAuthenticated, handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/signup`, { email, password }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);
      setMessage(response.data.message);
      if (response.data.user_id) {
        handleLogin(response.data.user_id); // Set the user ID after signup
        setIsAuthenticated(true);
        navigate('/alzheimer-detection'); // Redirect to AlzheimerDetectionPage
      }
    } catch (error) {
      console.error('There was an error signing up!', error);
      if (error.response) {
        alert(`Signup failed: ${error.response.data.message}`);
      } else {
        alert('Signup failed: Unable to connect to the server');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Signup</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={styles.input}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={styles.input}
        />
        <input 
          type="password" 
          placeholder="Confirm Password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          required 
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '50px',
    maxWidth: '400px',
    margin: 'auto',
    marginTop: '100px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  heading: {
    marginBottom: '20px',
    color: '#4b0082',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '5px',
    border: '1px solid #aaa',
    fontSize: '16px',
  },
  button: {
    padding: '10px',
    background: '#7b68ee',
    color: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    borderRadius: '5px',
    border: 'none',
  },
};

export default Signup;