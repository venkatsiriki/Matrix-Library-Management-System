// API base URL - handles both development and production
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// For production, use the deployed backend URL
// For development, use localhost with correct port
export const API_URL = process.env.REACT_APP_API_URL || 
  (isProduction 
    ? 'https://matrix-library-management-system.onrender.com'
    : 'http://localhost:5000'  // Updated to match actual backend port
  );

// Other API configurations can be added here
export const API_TIMEOUT = 30000; // 30 seconds 