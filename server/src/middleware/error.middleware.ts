import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { isProd } from "../config/env";

// Centralized error handler — must be registered last in app.ts.
// Converts known ApiErrors into clean JSON responses and logs
// unexpected errors without leaking internals in production.
export function errorMiddleware(
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  console.error("Unhandled error:", err);

  return res.status(500).json({
    success: false,
    message: isProd ? "Internal server error" : err.message,
  });
}

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}
