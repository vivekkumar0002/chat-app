import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { verifyToken } from "../utils/jwt";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

// Verifies the JWT sent by the client during the Socket.IO handshake
// (via `auth: { token }`) before allowing the connection to proceed.
export function socketAuthMiddleware(
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void
) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    const decoded = verifyToken(token);
    socket.userId = decoded.userId;
    socket.userEmail = decoded.email;

    next();
  } catch (err) {
    next(new Error("Invalid or expired authentication token"));
  }
}
