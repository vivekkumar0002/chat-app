import http from "http";
import { Server } from "socket.io";
import app from "./app";
import { env } from "./config/env";
import { socketAuthMiddleware, AuthenticatedSocket } from "./sockets/socketAuth";
import { registerSocketHandlers } from "./sockets/index";
import prisma from "./config/prisma";

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.CLIENT_URL.split(",").map((o) => o.trim()),
    credentials: true,
  },
});

// Authenticate every socket connection before it's accepted
io.use(socketAuthMiddleware as never);

registerSocketHandlers(io);

httpServer.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  console.log(`📡 Socket.IO ready for connections`);
});

// --- Graceful shutdown -------------------------------------------------
async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  io.close();
  await prisma.$disconnect();
  httpServer.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export { io };
