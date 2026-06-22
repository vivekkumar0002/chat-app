import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";

// Verifies the Bearer token on protected routes and attaches
// the decoded { userId, email } payload to req.user.
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("No authentication token provided"));
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return next(ApiError.unauthorized("Invalid or expired token"));
  }
}
