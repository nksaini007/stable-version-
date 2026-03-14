// ../../api/api.js
import axios from "axios";

const API = axios.create({
  baseURL: `/api`,
});

// Add token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // या context/state से
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
