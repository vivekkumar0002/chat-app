"use client"; 
import { useState, useRef, KeyboardEvent, FormEvent } from "react";
import { Send, Smile, Image as ImageIcon } from "lucide-react";
import EmojiPicker from "emoji-picker-react";


interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;

  onImageSelect: (file: File) => void;

  disabled?: boolean;
}
export function MessageInput({
  onSend,
  onTyping,
  onStopTyping,
  onImageSelect,
  disabled,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    onStopTyping();
    setValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
    >
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onTyping();
        }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type a message…"
        rows={1}
        className="scrollbar-thin max-h-32 flex-1 resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      />
      <div className="relative">
      <button
  type="button"
  onClick={() => setShowEmoji(!showEmoji)}
  className="flex h-10 w-10 items-center justify-center rounded-full border"
>
  <Smile className="h-5 w-5" />
</button>

  {showEmoji && (
    <div className="absolute bottom-12 right-0 z-50">
      <EmojiPicker
        onEmojiClick={(emojiData) => {
          setValue((prev) => prev + emojiData.emoji);
        }}
      />
    </div>
  )}
</div>
<input
  ref={fileInputRef}
  type="file"
  accept="image/*,video/*"
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  }}
/>

<button
  type="button"
  onClick={() => fileInputRef.current?.click()}
  className="flex h-10 w-10 items-center justify-center rounded-full border"
>
  <ImageIcon className="h-5 w-5" />
</button>
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
