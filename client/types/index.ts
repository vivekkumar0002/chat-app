export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export type MessageType = "TEXT" | "IMAGE" | "VIDEO";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;

  content: string;
  messageType?: MessageType;
  imageUrl?: string;
  videoUrl?: string;

  status: MessageStatus;
  isRead?: boolean;
  createdAt: string;

  sender?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface Participant {
  id: string;
  userId: string;
  user: User;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    status: MessageStatus;
  } | null;
  unreadCount?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Socket.IO event payload shapes
export interface TypingEventPayload {
  conversationId: string;
  userId: string;
  userName?: string;
}

export interface MessageReadEventPayload {
  conversationId: string;
  userId: string;
  messageIds: string[];
}

export interface UserStatusEventPayload {
  userId: string;
  isOnline: boolean;
  lastSeen: string;
}
