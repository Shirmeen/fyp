// filepath: /c:/Users/shirm/my-app/src/DatabaseVersion.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DatabaseVersion = () => {
  const [version, setVersion] = useState('');

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';
    axios.get(`${apiBaseUrl}/`)
      .then(response => {
        setVersion(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  return (
    <div>
      <h1>Database Version</h1>
      <p>{version}</p>
    </div>
  );
};

export default DatabaseVersion;