// Centralized API configuration for FusionNotes
// Locally, this will use the Vite proxy (/api)
// In production (Netlify), it will use the VITE_API_URL environment variable

const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  // If we are in production and have the environment variable, use it
  if (import.meta.env.PROD && url) {
    // Ensure no trailing slash to avoid double slashes in fetch('/api/...')
    return url.replace(/\/$/, '');
  }
  // Fallback to empty string for local dev (which uses Vite proxy)
  return '';
};

export const API_BASE_URL = getApiBaseUrl();
