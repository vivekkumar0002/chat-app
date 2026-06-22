"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { Conversation, User } from "../../types";
import { Avatar } from "../ui/Avatar";
import { ConversationItem } from "../chat/ConversationItem";
import { UserSearch } from "../chat/UserSearch";
import { EmptyState } from "../ui/Feedback";
import { useAuth } from "../../hooks/useAuth";
import { Users } from "lucide-react";

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  currentUserId: string;
  onlineUserIds: Set<string>;
  onSelectConversation: (conversation: Conversation) => void;
  onSelectUserForNewChat: (user: User) => void;
  isLoading: boolean;
}

export function Sidebar({
  conversations,
  activeConversationId,
  currentUserId,
  onlineUserIds,
  onSelectConversation,
  onSelectUserForNewChat,
  isLoading,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex h-full w-full flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:w-80">
      {/* Profile bar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2.5"
        >
          <Avatar name={user?.name || ""} src={user?.avatar} size="sm" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {user?.name}
          </span>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/profile")}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Settings"
          >
            <Settings className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={logout}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Log out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      <UserSearch onSelectUser={onSelectUserForNewChat} onlineUserIds={onlineUserIds} />

      {/* Recent chats */}
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-1 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No conversations yet"
            description="Search for someone above to start chatting."
          />
        ) : (
          conversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(
              (p) => p.userId !== currentUserId
            );
            return (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUserId}
                isActive={conversation.id === activeConversationId}
                isOnline={
                  otherParticipant ? onlineUserIds.has(otherParticipant.userId) : false
                }
                onClick={() => onSelectConversation(conversation)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
