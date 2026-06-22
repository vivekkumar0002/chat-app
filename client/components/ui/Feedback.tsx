"use client";

import { Loader2, MessageCircle, type LucideIcon } from "lucide-react";

export function LoadingSpinner({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin text-blue-600" style={{ width: size, height: size }} />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
      <LoadingSpinner size={32} />
    </div>
  );
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon = MessageCircle, title, description }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
      {description && (
        <p className="mt-1 max-w-xs text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}
