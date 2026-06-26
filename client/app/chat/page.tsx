"use client";

import { useState, useCallback, useEffect } from "react";
import { ProtectedRoute } from "../../components/layout/ProtectedRoute";
import { Sidebar } from "../../components/layout/Sidebar";
import { ChatHeader } from "../../components/chat/ChatHeader";
import { MessageList } from "../../components/chat/MessageList";
import { MessageInput } from "../../components/chat/MessageInput";
import { EmptyState } from "../../components/ui/Feedback";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { useConversations } from "../../hooks/useConversations";
import { useMessages } from "../../hooks/useMessages";
import { useTyping } from "../../hooks/useTyping";
import { useNotifications } from "../../hooks/useNotifications";
import { conversationService } from "../../services/conversationService";
import { Conversation, User } from "../../types";
import { MessageSquare } from "lucide-react";

function ChatDashboard() {
  const { user } = useAuth();
  const { onlineUserIds } = useSocket();
  const {
    conversations,
    isLoading: conversationsLoading,
    markConversationReadLocally,
    upsertConversation,
  } = useConversations(user?.id);

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);

  const { messages, sendMessage, sendImage } = useMessages(
    activeConversation?.id ?? null,
    user?.id
  );

  const otherParticipant = activeConversation?.participants.find((p) => p.userId !== user?.id);
  const otherUser = otherParticipant?.user;

  const { typingUserIds, notifyTyping, stopTyping } = useTyping(
    activeConversation?.id ?? null,
    user?.name ?? ""
  );

  const isOtherUserTyping = otherUser ? typingUserIds.has(otherUser.id) : false;

  const getSenderName = useCallback(
    (senderId: string) => {
      for (const conv of conversations) {
        const participant = conv.participants.find((p) => p.userId === senderId);
        if (participant) return participant.user.name;
      }
      return "New message";
    },
    [conversations]
  );

  useNotifications(user?.id, activeConversation?.id ?? null, getSenderName);

  // Mark conversation as read whenever it becomes active or new messages arrive in it.
  useEffect(() => {
    if (!activeConversation) return;
    conversationService.markRead(activeConversation.id).catch(() => {});
    markConversationReadLocally(activeConversation.id);
  }, [activeConversation, markConversationReadLocally, messages.length]);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
    setShowSidebarOnMobile(false);
  }, []);

  const handleSelectUserForNewChat = useCallback(
    async (selectedUser: User) => {
      const conversation = await conversationService.createConversation(selectedUser.id);
      upsertConversation(conversation);
      setActiveConversation(conversation);
      setShowSidebarOnMobile(false);
    },
    [upsertConversation]
  );

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sidebar: full width on mobile when no chat selected, fixed width on desktop */}
      <div
        className={`${
          showSidebarOnMobile ? "flex" : "hidden"
        } w-full md:flex md:w-80`}
      >
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversation?.id ?? null}
          currentUserId={user.id}
          onlineUserIds={onlineUserIds}
          onSelectConversation={handleSelectConversation}
          onSelectUserForNewChat={handleSelectUserForNewChat}
          isLoading={conversationsLoading}
        />
      </div>

      {/* Main chat area */}
      <div
        className={`${
          showSidebarOnMobile ? "hidden" : "flex"
        } flex-1 flex-col md:flex`}
      >
        {activeConversation && otherUser ? (
          <>
            <ChatHeader
              otherUser={otherUser}
              isOnline={onlineUserIds.has(otherUser.id)}
              onBack={() => setShowSidebarOnMobile(true)}
            />
            <MessageList
              messages={messages}
              currentUserId={user.id}
              isOtherUserTyping={isOtherUserTyping}
              otherUserName={otherUser.name}
            />
            <MessageInput
             onSend={sendMessage}
             onStopTyping={stopTyping}
             onImageSelect={sendImage}
             onTyping={notifyTyping}
             />
          </>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="Select a conversation"
            description="Choose a chat from the sidebar or search for someone to start a new conversation."
          />
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatDashboard />
    </ProtectedRoute>
  );
}
