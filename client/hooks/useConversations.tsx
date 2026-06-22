"use client";

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "./useSocket";
import { conversationService } from "../services/conversationService";
import { Conversation, Message } from "../types";

export function useConversations(currentUserId: string | undefined) {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await conversationService.listConversations();
      setConversations(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Keep the sidebar's last-message preview, ordering, and unread
  // counts in sync as new messages arrive anywhere in the app.
  useEffect(() => {
    if (!socket) return;

    function handleReceiveMessage(message: Message) {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === message.conversationId);
        if (idx === -1) {
          // Conversation not yet in local list (e.g. brand new) — refetch.
          refresh();
          return prev;
        }

        const updated = [...prev];
        const conv = { ...updated[idx] };
        conv.lastMessage = {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          createdAt: message.createdAt,
          status: message.status,
        };
        conv.updatedAt = message.createdAt;

        if (message.senderId !== currentUserId) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }

        updated.splice(idx, 1);
        updated.unshift(conv);
        return updated;
      });
    }

    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, currentUserId, refresh]);

  const markConversationReadLocally = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  const upsertConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) => {
      if (prev.some((c) => c.id === conversation.id)) return prev;
      return [conversation, ...prev];
    });
  }, []);

  return { conversations, isLoading, refresh, markConversationReadLocally, upsertConversation };
}
