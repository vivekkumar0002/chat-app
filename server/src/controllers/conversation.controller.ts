import { Response } from "express";
import { conversationService } from "../services/conversation.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import { ApiError } from "../utils/ApiError";

export const getConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const conversations = await conversationService.listForUser(req.user.userId);

  res.status(200).json({ success: true, data: { conversations } });
});

export const createConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const { userId: otherUserId } = req.body;
  const conversation = await conversationService.createOrGetOneToOne(
    req.user.userId,
    otherUserId
  );

  res.status(201).json({ success: true, data: { conversation } });
});

export const getConversationById = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const conversation = await conversationService.getById(req.params.id, req.user.userId);

  res.status(200).json({ success: true, data: { conversation } });
});

export const markConversationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  await conversationService.markRead(req.params.id, req.user.userId);

  res.status(200).json({ success: true, message: "Marked as read" });
});
