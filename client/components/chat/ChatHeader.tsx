import { ArrowLeft } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { User } from "../../types";
import { formatLastSeen } from "../../utils/format";

interface ChatHeaderProps {
  otherUser: User;
  isOnline: boolean;
  onBack?: () => void;
}

export function ChatHeader({ otherUser, isOnline, onBack }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      {onBack && (
        <button
          onClick={onBack}
          className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
          aria-label="Back to chats"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <Avatar name={otherUser.name} src={otherUser.avatar} isOnline={isOnline} showStatus />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
          {otherUser.name}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {isOnline ? "Online" : formatLastSeen(otherUser.lastSeen)}
        </p>
      </div>
    </div>
  );
}
