import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, "Not found"));
}
