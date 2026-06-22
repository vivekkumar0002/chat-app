import { Conversation, User } from "../../types";
import { Avatar } from "../ui/Avatar";
import { formatConversationTimestamp, truncateText } from "../../utils/format";
import { MessageStatusTicks } from "./MessageStatusTicks";

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isActive: boolean;
  isOnline: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  currentUserId,
  isActive,
  isOnline,
  onClick,
}: ConversationItemProps) {
  const otherParticipant = conversation.participants.find((p) => p.userId !== currentUserId);
  const otherUser: User | undefined = otherParticipant?.user;

  if (!otherUser) return null;

  const lastMessage = conversation.lastMessage;
  const isLastMessageOwn = lastMessage?.senderId === currentUserId;
  const hasUnread = (conversation.unreadCount || 0) > 0;

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20"
          : "hover:bg-gray-50 dark:hover:bg-gray-800/60"
      }`}
    >
      <Avatar name={otherUser.name} src={otherUser.avatar} isOnline={isOnline} showStatus />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            {otherUser.name}
          </p>
          {lastMessage && (
            <span className="shrink-0 text-[11px] text-gray-400">
              {formatConversationTimestamp(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p
            className={`truncate text-xs ${
              hasUnread
                ? "font-medium text-gray-700 dark:text-gray-200"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {isLastMessageOwn && lastMessage && (
              <span className="mr-1 inline-flex">
                <MessageStatusTicks status={lastMessage.status} />
              </span>
            )}
            {lastMessage ? truncateText(lastMessage.content, 38) : "Start the conversation"}
          </p>

          {hasUnread && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
              {conversation.unreadCount! > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
