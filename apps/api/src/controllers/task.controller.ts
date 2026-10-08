import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { TaskService } from "../services/task.service";
import { createTaskSchema, taskQuerySchema, updateTaskSchema } from "../validators/task.validator";
import { AppError } from "../utils/appError";
import { ZodError } from "zod";

export class TaskController {
  static async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Unauthorized");

      const data = createTaskSchema.parse(req.body);
      const task = await TaskService.createTask(userId, data);
      res.status(201).json({ data: task });
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(400, "Validation failed", error.issues));
      }
      next(error);
    }
  }

  static async getTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Unauthorized");

      const query = taskQuerySchema.parse(req.query);
      const tasks = await TaskService.getTasks(userId, query);
      res.status(200).json({ data: tasks });
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(400, "Validation failed", error.issues));
      }
      next(error);
    }
  }

  static async getTaskById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Unauthorized");

      const taskId = req.params.id as string;
      const task = await TaskService.getTaskById(userId, taskId);
      res.status(200).json({ data: task });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Unauthorized");

      const taskId = req.params.id as string;
      const data = updateTaskSchema.parse(req.body);

      const task = await TaskService.updateTask(userId, taskId, data);
      res.status(200).json({ data: task });
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(400, "Validation failed", error.issues));
      }
      next(error);
    }
  }

  static async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Unauthorized");

      const taskId = req.params.id as string;
      await TaskService.deleteTask(userId, taskId);
      res.status(200).json({ data: { message: "Task deleted successfully" } });
    } catch (error) {
      next(error);
    }
  }
}
