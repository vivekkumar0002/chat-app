import { apiClient } from "../lib/apiClient";
import { ApiResponse, Message } from "../types";

export const messageService = {
  async getMessages(conversationId: string, cursor?: string) {
    const res = await apiClient.get<ApiResponse<{ messages: Message[] }>>(
      `/messages/${conversationId}`,
      { params: cursor ? { cursor } : undefined }
    );
    return res.data.data.messages;
  },

  // REST fallback; primary send path is the Socket.IO `send_message` event.
  async sendMessage(conversationId: string, content: string) {
    const res = await apiClient.post<ApiResponse<{ message: Message }>>("/messages", {
      conversationId,
      content,
    });
    return res.data.data.message;
  },
};
