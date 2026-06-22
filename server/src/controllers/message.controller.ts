import { Response } from "express";
import { messageService } from "../services/message.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import { ApiError } from "../utils/ApiError";

export const getMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const { conversationId } = req.params;
  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

  const messages = await messageService.getMessages(conversationId, req.user.userId, cursor, limit);

  res.status(200).json({ success: true, data: { messages } });
});

// REST fallback for sending messages (primary path is the Socket.IO `send_message` event).
// Useful for clients without a live socket connection or for testing.
export const createMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const { conversationId, content } = req.body;

  const message = await messageService.createMessage(conversationId, req.user.userId, content);

  res.status(201).json({ success: true, data: { message } });
});
