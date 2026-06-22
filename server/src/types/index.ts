import { Request } from "express";

export interface JwtPayload {
  userId: string;
  email: string;
}

// Extends Express Request to include the authenticated user,
// attached by the auth middleware after verifying the JWT.
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
}

export interface ConversationWithDetails {
  id: string;
  isGroup: boolean;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  participants: {
    id: string;
    userId: string;
    user: SafeUser;
  }[];
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    status: string;
  } | null;
  unreadCount?: number;
}

// Socket.IO event payload contracts shared between server and client
export interface SendMessagePayload {
  conversationId: string;
  content: string;
}

export interface ReceiveMessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  status: string;
  createdAt: Date;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  userName: string;
}

export interface MessageReadPayload {
  conversationId: string;
  userId: string;
  messageIds: string[];
}

export interface UserStatusPayload {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}
