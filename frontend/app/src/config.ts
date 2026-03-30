// Centralized API configuration for FusionNotes
// Locally, this will use the Vite proxy (/api)
// In production (Netlify), it will use the VITE_API_URL environment variable

const getApiBaseUrl = () => {
  // If we are in production and have the environment variable, use it
  if (import.meta.env.PROD && import.meta.env.VITE_API_URL) {
    // Ensure no trailing slash to avoid double slashes in fetch('/api/...')
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  // Fallback to empty string for local dev (which uses Vite proxy)
  return '';
};

export const API_BASE_URL = getApiBaseUrl();
