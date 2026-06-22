export function TypingIndicator({ userName }: { userName?: string }) {
  return (
    <div className="flex justify-start px-4 py-1">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm dark:bg-gray-800">
        <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
        <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
        <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" />
        {userName && <span className="ml-1 text-xs text-gray-400">{userName} is typing…</span>}
      </div>
    </div>
  );
}
