import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";

export function formatMessageTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  return format(date, "h:mm a");
}

export function formatConversationTimestamp(dateInput: string | Date): string {
  const date = new Date(dateInput);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MM/dd/yyyy");
}

export function formatLastSeen(dateInput: string | Date): string {
  const date = new Date(dateInput);
  return `last seen ${formatDistanceToNow(date, { addSuffix: true })}`;
}

export function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic color from a string (e.g. user id) for avatar fallback backgrounds
export function getAvatarColor(seed: string): string {
  const colors = [
    "bg-rose-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
