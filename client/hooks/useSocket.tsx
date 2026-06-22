"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { Socket } from "socket.io-client";
import { useAuth } from "./useAuth";
import { getSocket, disconnectSocket } from "../lib/socketClient";
import { UserStatusEventPayload } from "../types";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: Set<string>;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  onlineUserIds: new Set(),
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const handleUserOnline = useCallback((payload: UserStatusEventPayload) => {
    setOnlineUserIds((prev) => new Set(prev).add(payload.userId));
  }, []);

  const handleUserOffline = useCallback((payload: UserStatusEventPayload) => {
    setOnlineUserIds((prev) => {
      const next = new Set(prev);
      next.delete(payload.userId);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!token || !user) {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const socketInstance = getSocket(token);
    setSocket(socketInstance);

    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    socketInstance.on("connect", onConnect);
    socketInstance.on("disconnect", onDisconnect);
    socketInstance.on("user_online", handleUserOnline);
    socketInstance.on("user_offline", handleUserOffline);

    if (socketInstance.connected) setIsConnected(true);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.off("user_online", handleUserOnline);
      socketInstance.off("user_offline", handleUserOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, onlineUserIds }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
