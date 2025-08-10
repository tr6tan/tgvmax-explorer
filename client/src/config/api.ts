const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:4000' 
  : 'https://votre-backend-url.com'; // Remplacez par l'URL de votre backend déployé

export const API_ENDPOINTS = {
  TGVMAX_SEARCH: `${API_BASE_URL}/api/tgvmax/search`,
  ALL_TRAINS: `${API_BASE_URL}/api/all-trains`,
  GOOGLE_PLACES_SEARCH: `${API_BASE_URL}/api/google-places/search-city`
};
