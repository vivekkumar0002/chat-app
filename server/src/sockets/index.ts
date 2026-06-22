import { Server } from "socket.io";
import { AuthenticatedSocket } from "./socketAuth";
import { presenceRegistry } from "./presenceRegistry";
import prisma from "../config/prisma";
import { messageService } from "../services/message.service";
import { conversationService } from "../services/conversation.service";
import {
  SendMessagePayload,
  TypingPayload,
  MessageReadPayload,
} from "../types";

// Each connected user joins a personal room named after their userId.
// This lets us push events (new messages, status changes) to every
// device/tab a user has open without tracking individual socket ids
// at the call site.
function userRoom(userId: string) {
  return `user:${userId}`;
}

export function registerSocketHandlers(io: Server) {
  io.on("connection", async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    console.log(`Socket connected: ${socket.id} (user ${userId})`);

    // --- Presence: connection ------------------------------------------
    const wasOffline = !presenceRegistry.isOnline(userId);
    presenceRegistry.addSocket(userId, socket.id);
    socket.join(userRoom(userId));

    if (wasOffline) {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true },
      });

      // Notify every conversation participant that this user is now online.
      // Broadcasting globally is simplest; for very large user bases you'd
      // scope this to only the user's actual conversation partners.
      io.emit("user_online", {
        userId,
        isOnline: true,
        lastSeen: updated.lastSeen,
      });
    }

    // Join a room for every conversation this user belongs to, so
    // `io.to(conversationRoom).emit(...)` reaches all participants.
    const participantRows: { conversationId: string }[] = await prisma.participant.findMany({
      where: { userId },
      select: { conversationId: true },
    });
    participantRows.forEach((row: { conversationId: string }) => {
      socket.join(`conversation:${row.conversationId}`);
    });

    // --- send_message -----------------------------------------------
    socket.on("send_message", async (payload: SendMessagePayload, ack?: (res: unknown) => void) => {
      try {
        const { conversationId, content } = payload;

        const message = await messageService.createMessage(conversationId, userId, content);

        const responsePayload = {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          status: message.status,
          createdAt: message.createdAt,
          sender: message.sender,
        };

        // Push to everyone in the conversation room (including sender,
        // so all of the sender's own tabs/devices stay in sync).
        io.to(`conversation:${conversationId}`).emit("receive_message", responsePayload);

        // Acknowledge back to the sender for optimistic-UI reconciliation
        if (ack) ack({ success: true, message: responsePayload });
      } catch (err) {
        console.error("send_message error:", err);
        if (ack) ack({ success: false, error: (err as Error).message });
      }
    });

    // --- typing indicators --------------------------------------------
    socket.on("typing_start", (payload: TypingPayload) => {
      socket
        .to(`conversation:${payload.conversationId}`)
        .emit("typing_start", { ...payload, userId });
    });

    socket.on("typing_stop", (payload: TypingPayload) => {
      socket
        .to(`conversation:${payload.conversationId}`)
        .emit("typing_stop", { ...payload, userId });
    });

    // --- read receipts ---------------------------------------------------
    socket.on("message_read", async (payload: MessageReadPayload) => {
      try {
        await conversationService.markRead(payload.conversationId, userId);

        io.to(`conversation:${payload.conversationId}`).emit("message_read", {
          conversationId: payload.conversationId,
          userId,
          messageIds: payload.messageIds,
        });
      } catch (err) {
        console.error("message_read error:", err);
      }
    });

    // --- joining a new conversation room on demand (e.g. right after creation) ---
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    // --- disconnect -------------------------------------------------------
    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${socket.id} (user ${userId})`);

      const isNowFullyOffline = presenceRegistry.removeSocket(userId, socket.id);

      if (isNowFullyOffline) {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false, lastSeen: new Date() },
        });

        io.emit("user_offline", {
          userId,
          isOnline: false,
          lastSeen: updated.lastSeen,
        });
      }
    });
  });
}
