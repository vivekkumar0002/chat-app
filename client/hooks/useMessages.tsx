"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { messageService } from "../services/messageService";
import { Message, MessageReadEventPayload } from "../types";

export function useMessages(conversationId: string | null, currentUserId: string | undefined) {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;

  // Fetch message history whenever the active conversation changes.
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    messageService
      .getMessages(conversationId)
      .then((data) => {
        if (!cancelled) setMessages(data);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load messages");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    // Join the conversation's socket room so we receive live events for it
    socket?.emit("join_conversation", conversationId);

    return () => {
      cancelled = true;
    };
  }, [conversationId, socket]);

  // Listen for incoming messages and read receipts in real time.
  useEffect(() => {
    if (!socket) return;

    function handleReceiveMessage(message: Message) {
      if (message.conversationId !== conversationIdRef.current) return;
      setMessages((prev) => {
        // Avoid duplicates if the REST fallback and socket both fire
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    }

    function handleMessageRead(payload: MessageReadEventPayload) {
      if (payload.conversationId !== conversationIdRef.current) return;
      setMessages((prev) =>
        prev.map((m) =>
          payload.messageIds.includes(m.id) || m.senderId === currentUserId
            ? { ...m, status: "READ" as const, isRead: true }
            : m
        )
      );
    }

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_read", handleMessageRead);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_read", handleMessageRead);
    };
  }, [socket, currentUserId]);

  // Sends via Socket.IO with an ack callback; falls back to REST if the socket is down.
  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return;

      if (socket && socket.connected) {
        socket.emit(
          "send_message",
          { conversationId, content },
          (response: { success: boolean; message?: Message; error?: string }) => {
            if (!response.success) {
              setError(response.error || "Failed to send message");
            }
          }
        );
      } else {
        try {
          const message = await messageService.sendMessage(conversationId, content);
          setMessages((prev) => [...prev, message]);
        } catch {
          setError("Failed to send message");
        }
      }
    },
    [conversationId, socket]
  );

  return { messages, isLoading, error, sendMessage };
}
