import Axios from "axios";

// Use VITE_API_BASE if provided. Otherwise, in production (Vercel) use a
// relative `/api` path (so requests go to the deployed serverless functions).
// In development fall back to the local server URL.
const baseURL =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.PROD ? "/api" : "http://localhost:4000/api");

const api = Axios.create({ baseURL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
