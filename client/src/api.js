import axios from "axios";
import Cookies from "js-cookie";

export const STRAPI_URL = "http://localhost:1337"; // <- add this

const api = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = (email, password) =>
  api.post("/auth/local", { identifier: email, password });

export const signup = (username, email, password) =>
  api.post("/auth/local/register", { username, email, password });

export default api;
