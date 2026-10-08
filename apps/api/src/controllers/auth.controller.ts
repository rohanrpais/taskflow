import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../utils/appError";
import { ZodError } from "zod";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const result = await AuthService.register(data);
      res.status(201).json({ data: result });
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(400, "Validation failed", error.issues));
      }
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.login(data);
      res.status(200).json({ data: result });
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(400, "Validation failed", error.issues));
      }
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({ data: { message: "Logged out successfully" } });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, "Unauthorized");
      }
      const user = await AuthService.getMe(userId);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  }
}
