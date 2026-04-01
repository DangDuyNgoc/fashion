/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/api";

export const authService = {
  register: (data: any) => api.post("/auth/register", data),

  login: (data: any) => api.post("/auth/login", data),

  verifyEmail: (data: any) => api.post("/auth/verify-email", data),

  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forgot-password", data),

  resetPassword: (data: any) =>
    api.post("/auth/reset-password", data),

  getProfile: () => api.get("/auth/me"),

  updateProfile: (data: any) =>
    api.put("/auth/profile", data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/auth/upload-avatar", formData);
  },

  getAllUsers: () => api.get("/auth/users"),

  updateUserRole: (id: string, role: string) => 
    api.put(`/auth/${id}/role`, { role }),

  deleteUser: (id: string) => 
    api.delete(`/auth/${id}`),

  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refreshToken }),
};