"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { Message } from "../types";

// Requests Notification permission once, then shows a browser
// notification for incoming messages while the tab is not focused
// and the message isn't in the currently active conversation.
export function useNotifications(
  currentUserId: string | undefined,
  activeConversationId: string | null,
  getSenderName: (senderId: string) => string
) {
  const { socket } = useSocket();
  const isTabFocusedRef = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    function handleFocus() {
      isTabFocusedRef.current = true;
    }
    function handleBlur() {
      isTabFocusedRef.current = false;
    }
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const showNotification = useCallback(
    (message: Message) => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      if (message.senderId === currentUserId) return;

      // Skip if the user is actively viewing this exact conversation with the tab focused
      if (isTabFocusedRef.current && message.conversationId === activeConversationId) return;

      const senderName = getSenderName(message.senderId);
      const notification = new Notification(senderName, {
        body: message.content,
        icon: "/favicon.ico",
        tag: message.conversationId,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    },
    [currentUserId, activeConversationId, getSenderName]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on("receive_message", showNotification);
    return () => {
      socket.off("receive_message", showNotification);
    };
  }, [socket, showNotification]);
}
