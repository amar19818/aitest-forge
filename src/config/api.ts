const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-backend-domain.com/api'
  : 'http://localhost:5000/api';

export { API_BASE_URL };