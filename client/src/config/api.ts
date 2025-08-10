const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:4000' 
  : 'https://tgvmax-explorer-production.up.railway.app'; // URL du backend déployé sur Railway

export const API_ENDPOINTS = {
  TGVMAX_SEARCH: `${API_BASE_URL}/api/tgvmax/search`,
  ALL_TRAINS: `${API_BASE_URL}/api/all-trains`,
  GOOGLE_PLACES_SEARCH: `${API_BASE_URL}/api/google-places/search-city`,
  OUISNCF_SEARCH: `${API_BASE_URL}/api/ouisncf/search`,
  SNCF_OFFICIAL_JOURNEYS: `${API_BASE_URL}/api/sncf-official/journeys`,
  SNCF_OFFICIAL_DEPARTURES: `${API_BASE_URL}/api/sncf-official/departures`
};
