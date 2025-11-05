// services/api.js
const API_BASE_URL = import.meta.env.VITE_LARAVEL_API;

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API error ${response.status}:`, errorText);
    throw new Error(`API error: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return {};
};

const api = {
  get: async (endpoint) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      return await handleResponse(response);
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  },

  post: async (endpoint, data) => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }
};

export default api;