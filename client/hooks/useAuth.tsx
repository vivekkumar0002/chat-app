"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "../types";
import { authService } from "../services/authService";
import { disconnectSocket } from "../lib/socketClient";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateLocalUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount, restore session from localStorage and verify it's still valid.
  useEffect(() => {
    const storedToken = localStorage.getItem("chat_token");
    const storedUser = localStorage.getItem("chat_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));

      // Verify token is still valid server-side and refresh user data
      authService
        .getMe()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem("chat_user", JSON.stringify(freshUser));
        })
        .catch(() => {
          localStorage.removeItem("chat_token");
          localStorage.removeItem("chat_user");
          setUser(null);
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const persistSession = useCallback((newUser: User, newToken: string) => {
    localStorage.setItem("chat_token", newToken);
    localStorage.setItem("chat_user", JSON.stringify(newUser));
    setUser(newUser);
    setToken(newToken);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user: loggedInUser, token: newToken } = await authService.login(
        email,
        password
      );
      persistSession(loggedInUser, newToken);
      router.push("/chat");
    },
    [persistSession, router]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { user: newUser, token: newToken } = await authService.register(
        name,
        email,
        password
      );
      persistSession(newUser, newToken);
      router.push("/chat");
    },
    [persistSession, router]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if the server call fails, clear local session so the user can still log out.
    }
    disconnectSocket();
    localStorage.removeItem("chat_token");
    localStorage.removeItem("chat_user");
    setUser(null);
    setToken(null);
    router.push("/login");
  }, [router]);

  const updateLocalUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("chat_user", JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, updateLocalUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
