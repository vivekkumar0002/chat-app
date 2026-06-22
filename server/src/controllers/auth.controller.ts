import { Request, Response } from "express";
import { authService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import { ApiError } from "../utils/ApiError";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const { user, token } = await authService.register(name, email, password);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: { user, token },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, token } = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: { user, token },
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const user = await authService.getProfile(req.user.userId);

  res.status(200).json({ success: true, data: { user } });
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  await authService.logout(req.user.userId);

  res.status(200).json({ success: true, message: "Logged out successfully" });
});
