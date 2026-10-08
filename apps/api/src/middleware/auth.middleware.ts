import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Unauthorized - Missing or invalid token"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    next(new AppError(401, "Unauthorized - Invalid or expired token"));
  }
}
