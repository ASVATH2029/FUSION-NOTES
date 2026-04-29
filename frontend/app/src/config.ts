// Centralized API configuration for FusionNotes
// Locally, this will use the Vite proxy (/api)
// In production (Netlify), it will use the VITE_API_URL environment variable

const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  
  if (import.meta.env.PROD) {
    if (url && url.includes('localhost')) {
      console.warn("⚠️ FusionNotes: VITE_API_URL is pointing to localhost in PRODUCTION. This will only work on the host machine!");
    }
    if (!url) {
      console.warn("⚠️ FusionNotes: VITE_API_URL is missing in PRODUCTION. API requests will be relative to the frontend domain.");
    }
    return url ? url.replace(/\/$/, '') : '';
  }
  
  // Fallback to empty string for local dev (which uses Vite proxy)
  return url ? url.replace(/\/$/, '') : '';
};

export const API_BASE_URL = getApiBaseUrl();
