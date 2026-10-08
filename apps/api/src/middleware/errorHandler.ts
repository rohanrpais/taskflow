import type { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { AppError } from "../utils/appError";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : "Internal server error";

  if (!isAppError) {
    const unexpected = err instanceof Error ? err.message : "Unknown error";
    logger.error(`Unhandled error: ${unexpected}`);
  }

  const payload: { error: { message: string; details?: unknown } } = {
    error: { message },
  };

  if (isAppError && err.details !== undefined) {
    payload.error.details = err.details;
  }

  if (!isAppError && env.NODE_ENV !== "production" && err instanceof Error) {
    payload.error.details = { stack: err.stack };
  }

  res.status(statusCode).json(payload);
}
