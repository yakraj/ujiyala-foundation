import Axios from "axios";

// Use VITE_API_BASE only during development (so `npm run dev` can point to
// a local server). For production builds we always use the relative `/api`
// path so the frontend calls serverless functions on the same domain.
const baseURL = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'
  : '/api';

const api = Axios.create({ baseURL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
