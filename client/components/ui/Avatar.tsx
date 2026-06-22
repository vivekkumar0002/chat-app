"use client";

import Image from "next/image";
import { getInitials, getAvatarColor } from "../../utils/format";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  isOnline?: boolean;
  showStatus?: boolean;
}

const sizeMap = {
  sm: { box: "w-8 h-8", text: "text-xs", dot: "w-2 h-2" },
  md: { box: "w-10 h-10", text: "text-sm", dot: "w-2.5 h-2.5" },
  lg: { box: "w-14 h-14", text: "text-lg", dot: "w-3 h-3" },
  xl: { box: "w-24 h-24", text: "text-3xl", dot: "w-4 h-4" },
};

export function Avatar({ name, src, size = "md", isOnline, showStatus = false }: AvatarProps) {
  const { box, text, dot } = sizeMap[size];

  return (
    <div className={`relative inline-flex shrink-0 ${box}`}>
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="96px"
          className="rounded-full object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center rounded-full font-semibold text-white ${getAvatarColor(
            name
          )} ${text}`}
        >
          {getInitials(name)}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 ${dot} rounded-full border-2 border-white dark:border-gray-900 ${
            isOnline ? "bg-emerald-500" : "bg-gray-400 dark:bg-gray-600"
          }`}
          aria-label={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}
