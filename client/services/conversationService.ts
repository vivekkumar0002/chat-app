import { apiClient } from "../lib/apiClient";
import { ApiResponse, Conversation } from "../types";

export const conversationService = {
  async listConversations() {
    const res = await apiClient.get<ApiResponse<{ conversations: Conversation[] }>>(
      "/conversations"
    );
    return res.data.data.conversations;
  },

  async createConversation(userId: string) {
    const res = await apiClient.post<ApiResponse<{ conversation: Conversation }>>(
      "/conversations",
      { userId }
    );
    return res.data.data.conversation;
  },

  async getConversationById(id: string) {
    const res = await apiClient.get<ApiResponse<{ conversation: Conversation }>>(
      `/conversations/${id}`
    );
    return res.data.data.conversation;
  },

  async markRead(id: string) {
    await apiClient.post(`/conversations/${id}/read`);
  },
};
