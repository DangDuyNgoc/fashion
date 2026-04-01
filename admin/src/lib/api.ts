/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5015/api",
  withCredentials: true,
});

// attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// handle refresh token
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes("/auth/login")) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const res = await axios.post("http://localhost:5015/api/auth/refresh", { refreshToken });

        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

        return api(originalRequest);
      } catch (refreshErr) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Only redirect if we are not already on the login page
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
        }

        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

export default api;