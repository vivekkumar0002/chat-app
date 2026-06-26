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

  async sendMessage(conversationId: string, content: string) {
    const res = await apiClient.post<ApiResponse<{ message: Message }>>(
      "/messages",
      {
        conversationId,
        content,
      }
    );

    return res.data.data.message;
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);

    const res = await apiClient.post<
      ApiResponse<{
        url: string;
        publicId: string;
      }>

    >("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("UPLOAD RESPONSE:", res.data);

    return res.data.data;
  },
};