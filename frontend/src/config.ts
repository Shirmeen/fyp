// API Configuration
// In development: http://127.0.0.1:5000
// In production: Set VITE_API_URL environment variable to your Render backend URL

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
