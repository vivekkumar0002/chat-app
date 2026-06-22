import { Message } from "../../types";
import { formatMessageTime } from "../../utils/format";
import { MessageStatusTicks } from "./MessageStatusTicks";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSenderName?: boolean;
}

export function MessageBubble({ message, isOwn, showSenderName }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} px-4 py-0.5`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm ${
          isOwn
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        {showSenderName && !isOwn && message.sender && (
          <p className="mb-0.5 text-xs font-semibold text-blue-500">{message.sender.name}</p>
        )}
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {message.content}
        </p>
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
            isOwn ? "text-blue-100" : "text-gray-400"
          }`}
        >
          <span>{formatMessageTime(message.createdAt)}</span>
          {isOwn && <MessageStatusTicks status={message.status} />}
        </div>
      </div>
    </div>
  );
}
