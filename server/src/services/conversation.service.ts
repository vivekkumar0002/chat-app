import prisma from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { ConversationWithDetails } from "../types";

const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  isOnline: true,
  lastSeen: true,
  createdAt: true,
};

type ParticipantRow = { conversationId: string; lastReadAt: Date | null };

const conversationService = {
  // Finds an existing 1:1 conversation between two users, or creates a new one.
  async createOrGetOneToOne(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      throw ApiError.badRequest("Cannot start a conversation with yourself");
    }

    const otherUser = await prisma.user.findUnique({ where: { id: otherUserId } });
    if (!otherUser) {
      throw ApiError.notFound("User not found");
    }

    // Look for an existing non-group conversation that contains exactly these two participants
    const existing = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        participants: { include: { user: { select: userSafeSelect } } },
      },
    });

    if (existing) return existing;

    const conversation = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: {
        participants: { include: { user: { select: userSafeSelect } } },
      },
    });

    return conversation;
  },

  // Returns all conversations for a user, each enriched with the last
  // message and an unread count, sorted by most recent activity.
  async listForUser(userId: string): Promise<ConversationWithDetails[]> {
    const participantRows: ParticipantRow[] = await prisma.participant.findMany({
      where: { userId },
      select: { conversationId: true, lastReadAt: true },
    });

    const conversationIds = participantRows.map((p: ParticipantRow) => p.conversationId);
    const lastReadMap = new Map(
      participantRows.map((p: ParticipantRow) => [p.conversationId, p.lastReadAt])
    );

    if (conversationIds.length === 0) return [];

    const conversations = await prisma.conversation.findMany({
      where: { id: { in: conversationIds } },
      include: {
        participants: { include: { user: { select: userSafeSelect } } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    type ConvWithIncludes = (typeof conversations)[number];
    type ParticipantWithUser = ConvWithIncludes["participants"][number];

    const results: ConversationWithDetails[] = await Promise.all(
      conversations.map(async (conv: ConvWithIncludes) => {
        const lastReadAt = lastReadMap.get(conv.id) ?? null;

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
          },
        });

        const lastMsg = conv.messages[0];

        return {
          id: conv.id,
          isGroup: conv.isGroup,
          name: conv.name,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          participants: conv.participants.map((p: ParticipantWithUser) => ({
            id: p.id,
            userId: p.userId,
            user: p.user,
          })),
          lastMessage: lastMsg
            ? {
                id: lastMsg.id,
                content: lastMsg.content,
                senderId: lastMsg.senderId,
                createdAt: lastMsg.createdAt,
                status: lastMsg.status,
              }
            : null,
          unreadCount,
        };
      })
    );

    return results;
  },

  async getById(conversationId: string, userId: string) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: { include: { user: { select: userSafeSelect } } },
      },
    });

    if (!conversation) throw ApiError.notFound("Conversation not found");

    type ParticipantWithUser = (typeof conversation)["participants"][number];
    const isParticipant = conversation.participants.some(
      (p: ParticipantWithUser) => p.userId === userId
    );
    if (!isParticipant) throw ApiError.forbidden("You are not part of this conversation");

    return conversation;
  },

  async assertParticipant(conversationId: string, userId: string) {
    const participant = await prisma.participant.findUnique({
      where: { userId_conversationId: { userId, conversationId } },
    });
    if (!participant) {
      throw ApiError.forbidden("You are not part of this conversation");
    }
    return participant;
  },

  async markRead(conversationId: string, userId: string) {
    await this.assertParticipant(conversationId, userId);

    await prisma.participant.update({
      where: { userId_conversationId: { userId, conversationId } },
      data: { lastReadAt: new Date() },
    });

    await prisma.message.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true, status: "READ" },
    });
  },
};

export { conversationService };
