import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { DashboardService } from "../services/dashboard.service";
import { AppError } from "../utils/appError";

export class DashboardController {
  static async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Unauthorized");

      const stats = await DashboardService.getDashboardStats(userId);
      res.status(200).json({ data: stats });
    } catch (error) {
      next(error);
    }
  }
}
