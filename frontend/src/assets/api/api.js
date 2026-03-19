// ../../api/api.js
import axios from "axios";

const fallbackURL = "https://stable-version-backend.onrender.com";
const baseURL = import.meta.env.VITE_API_URL || fallbackURL;

const API = axios.create({
  baseURL: baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`,
});

// Add interceptor to handle URLs and strip leading slashes if baseURL is set
API.interceptors.request.use((config) => {
  // If URL starts with / and baseURL is specified, Axios treats it as absolute path from root.
  // We want it to be relative to baseURL.
  if (config.url && config.url.startsWith("/")) {
    config.url = config.url.substring(1);
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
