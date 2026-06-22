import { Response } from "express";
import { userService } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import { ApiError } from "../utils/ApiError";

export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const search = typeof req.query.search === "string" ? req.query.search : undefined;
  const users = await userService.listUsers(req.user.userId, search);

  res.status(200).json({ success: true, data: { users } });
});

export const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({ success: true, data: { user } });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const { name, avatar } = req.body;
  const user = await userService.updateProfile(req.user.userId, { name, avatar });

  res.status(200).json({ success: true, message: "Profile updated", data: { user } });
});
