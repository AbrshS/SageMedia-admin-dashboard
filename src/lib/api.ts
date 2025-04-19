import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    const parsedToken = JSON.parse(token);
    config.headers.Authorization = `Bearer ${parsedToken.state.token}`;
  }
  return config;
});

export default api;