import Axios from "axios";
const api = Axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:4000/api",
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;
