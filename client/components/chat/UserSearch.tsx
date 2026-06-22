"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { User } from "../../types";
import { userService } from "../../services/userService";
import { Avatar } from "../ui/Avatar";
import { LoadingSpinner } from "../ui/Feedback";

interface UserSearchProps {
  onSelectUser: (user: User) => void;
  onlineUserIds: Set<string>;
}

export function UserSearch({ onSelectUser, onlineUserIds }: UserSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const search = useCallback(async (term: string) => {
    setIsLoading(true);
    try {
      const users = await userService.listUsers(term || undefined);
      setResults(users);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    if (!isOpen) return;
    const handle = setTimeout(() => search(query), 300);
    return () => clearTimeout(handle);
  }, [query, isOpen, search]);

  return (
    <div className="relative border-b border-gray-200 p-3 dark:border-gray-800">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search people…"
          className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        {isOpen && (
          <button
            onClick={() => {
              setIsOpen(false);
              setQuery("");
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-3 right-3 top-full z-20 mt-1 max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {isLoading ? (
            <LoadingSpinner className="py-6" />
          ) : results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">No users found</p>
          ) : (
            results.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onSelectUser(user);
                  setIsOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Avatar
                  name={user.name}
                  src={user.avatar}
                  size="sm"
                  isOnline={onlineUserIds.has(user.id)}
                  showStatus
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
