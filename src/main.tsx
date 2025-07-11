import React from 'react';
import ReactDOM from 'react-dom/client';
import AlzheimerDetectionPage from './App'; // or './AlzheimerDetectionPage' if you created a separate file

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AlzheimerDetectionPage />
  </React.StrictMode>
);