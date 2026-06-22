"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "./useSocket";
import { TypingEventPayload } from "../types";

const TYPING_STOP_DELAY_MS = 2000;

// Manages "typing_start" / "typing_stop" socket emissions for the
// local user (debounced), and tracks which other users are
// currently typing in a given conversation.
export function useTyping(conversationId: string | null, userName: string) {
  const { socket } = useSocket();
  const [typingUserIds, setTypingUserIds] = useState<Set<string>>(new Set());
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!socket || !conversationId) return;

    function handleTypingStart(payload: TypingEventPayload) {
      if (payload.conversationId !== conversationId) return;
      setTypingUserIds((prev) => new Set(prev).add(payload.userId));
    }

    function handleTypingStop(payload: TypingEventPayload) {
      if (payload.conversationId !== conversationId) return;
      setTypingUserIds((prev) => {
        const next = new Set(prev);
        next.delete(payload.userId);
        return next;
      });
    }

    socket.on("typing_start", handleTypingStart);
    socket.on("typing_stop", handleTypingStop);

    return () => {
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_stop", handleTypingStop);
      setTypingUserIds(new Set());
    };
  }, [socket, conversationId]);

  // Call this on every keystroke in the message input.
  const notifyTyping = useCallback(() => {
    if (!socket || !conversationId) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing_start", { conversationId, userName });
    }

    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);

    stopTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("typing_stop", { conversationId, userName });
    }, TYPING_STOP_DELAY_MS);
  }, [socket, conversationId, userName]);

  // Call this immediately when the message is sent, to stop the indicator early.
  const stopTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    isTypingRef.current = false;
    socket.emit("typing_stop", { conversationId, userName });
  }, [socket, conversationId, userName]);

  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, []);

  return { typingUserIds, notifyTyping, stopTyping };
}
