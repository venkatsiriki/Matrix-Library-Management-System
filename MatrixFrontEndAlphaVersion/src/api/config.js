// API base URL - handles both development and production
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Determine base origin (WITHOUT /api) and normalize to avoid trailing slashes or accidental /api
let baseOrigin = process.env.REACT_APP_API_URL || (isProduction
  ? 'https://matrix-library-management-system.onrender.com'
  : 'http://localhost:5000');

// Remove trailing slash and a trailing /api if provided via env
baseOrigin = baseOrigin.replace(/\/$/, '').replace(/\/api$/, '');

export const API_URL = baseOrigin;

// Other API configurations can be added here
export const API_TIMEOUT = 30000; // 30 seconds 