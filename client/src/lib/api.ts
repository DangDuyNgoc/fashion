/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const BASE_URL = "http://localhost:5015";
const API_URL = `${BASE_URL}/api`;
export const IMAGE_BASE_URL = `${BASE_URL}/images`;

export const formatImageUrl = (url?: string) => {
  if (!url) return "/placeholder.png";
  if (url.startsWith("http")) return url;

  const path = url.startsWith("/") ? url : `/${url}`;

  if (path.startsWith("/images")) {
    return `${BASE_URL}${path}`;
  }
  return `${BASE_URL}/images${path}`;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// attach access token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// handle refresh token
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          typeof window !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null;

        if (!refreshToken) return Promise.reject(err);

        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", res.data.accessToken);
          localStorage.setItem("refreshToken", res.data.refreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

        return api(originalRequest);
      } catch (refreshErr) {
        const err = refreshErr as any;
        console.error(
          "Refresh token error:",
          err.response?.data || err.message
        );

        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");

          setTimeout(() => {
            window.location.href = "/login";
          }, 3000);
        }

        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

export default api;