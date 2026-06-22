import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { conversationService } from "./conversation.service";

export const messageService = {
  async getMessages(conversationId: string, userId: string, cursor?: string, limit = 50) {
    await conversationService.assertParticipant(conversationId, userId);

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Return in ascending order for natural chat rendering
    return messages.reverse();
  },

  async createMessage(conversationId: string, senderId: string, content: string) {
    await conversationService.assertParticipant(conversationId, senderId);

    if (!content || !content.trim()) {
      throw ApiError.badRequest("Message content cannot be empty");
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim(),
        status: "SENT",
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Bump conversation's updatedAt so it sorts to top of recent chats
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  },

  async markDelivered(messageIds: string[]) {
    await prisma.message.updateMany({
      where: { id: { in: messageIds }, status: "SENT" },
      data: { status: "DELIVERED" },
    });
  },
};
