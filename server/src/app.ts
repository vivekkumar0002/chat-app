import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env, isProd } from "./config/env";
import { apiLimiter } from "./middleware/rateLimit.middleware";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import conversationRoutes from "./routes/conversation.routes";
import messageRoutes from "./routes/message.routes";

const app = express();

// --- Security & parsing middleware -----------------------------------
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL.split(",").map((o) => o.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(isProd ? "combined" : "dev"));
app.use("/api", apiLimiter);

// --- Health check -------------------------------------------------------
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "OK", timestamp: new Date().toISOString() });
});

// --- API routes -----------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// --- 404 + error handling (must be last) ---------------------------------
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
