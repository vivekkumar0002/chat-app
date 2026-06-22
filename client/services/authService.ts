import { apiClient } from "../lib/apiClient";
import { ApiResponse, AuthResponse, User } from "../types";

export const authService = {
  async register(name: string, email: string, password: string) {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", {
      name,
      email,
      password,
    });
    return res.data.data;
  },

  async login(email: string, password: string) {
    const res = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", {
      email,
      password,
    });
    return res.data.data;
  },

  async getMe() {
    const res = await apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
    return res.data.data.user;
  },

  async logout() {
    await apiClient.post("/auth/logout");
  },
};
