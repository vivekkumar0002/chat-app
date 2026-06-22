"use client";

import { useEffect, useRef } from "react";
import { Message } from "../../types";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "../ui/Feedback";
import { MessageCircle } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isOtherUserTyping: boolean;
  otherUserName?: string;
}

export function MessageList({
  messages,
  currentUserId,
  isOtherUserTyping,
  otherUserName,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message whenever the list changes or someone starts typing.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isOtherUserTyping]);

  if (messages.length === 0 && !isOtherUserTyping) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No messages yet"
        description="Send a message to start the conversation."
      />
    );
  }

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto py-4">
      {messages.map((message, idx) => {
        const prevMessage = messages[idx - 1];
        const showSenderName = !prevMessage || prevMessage.senderId !== message.senderId;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
            showSenderName={showSenderName}
          />
        );
      })}

      {isOtherUserTyping && <TypingIndicator userName={otherUserName} />}

      <div ref={bottomRef} />
    </div>
  );
}
