import { apiClient } from "../lib/apiClient";
import { ApiResponse, User } from "../types";

export const userService = {
  async listUsers(search?: string) {
    const res = await apiClient.get<ApiResponse<{ users: User[] }>>("/users", {
      params: search ? { search } : undefined,
    });
    return res.data.data.users;
  },

  async getUserById(id: string) {
    const res = await apiClient.get<ApiResponse<{ user: User }>>(`/users/${id}`);
    return res.data.data.user;
  },

  async updateProfile(data: { name?: string; avatar?: string }) {
    const res = await apiClient.patch<ApiResponse<{ user: User }>>("/users/me", data);
    return res.data.data.user;
  },
};
