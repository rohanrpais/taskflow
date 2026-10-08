import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { ProjectService } from "../services/project.service";
import { createProjectSchema, projectQuerySchema, updateProjectSchema } from "../validators/project.validator";
import { AppError } from "../utils/appError";
import { ZodError } from "zod";

export class ProjectController {
  static async createProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Unauthorized");

      const data = createProjectSchema.parse(req.body);
      const project = await ProjectService.createProject(userId, data);
      res.status(201).json({ data: project });
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(400, "Validation failed", error.issues));
      }
      next(error);
    }
  }

  static async getProjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Unauthorized");

      const query = projectQuerySchema.parse(req.query);
      const projects = await ProjectService.getProjects(userId, query.search, query.status);
      res.status(200).json({ data: projects });
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(400, "Validation failed", error.issues));
      }
      next(error);
    }
  }

  static async getProjectById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Unauthorized");

      const projectId = req.params.id as string;
      const project = await ProjectService.getProjectById(userId, projectId);
      res.status(200).json({ data: project });
    } catch (error) {
      next(error);
    }
  }

  static async updateProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Unauthorized");

      const projectId = req.params.id as string;
      const data = updateProjectSchema.parse(req.body);

      // Validate end date >= start date if both are updated
      if (data.startDate && data.endDate && data.endDate < data.startDate) {
        throw new AppError(400, "Validation failed", [{ message: "End date cannot be earlier than start date", path: ["endDate"] }]);
      }

      const project = await ProjectService.updateProject(userId, projectId, data);
      res.status(200).json({ data: project });
    } catch (error) {
      if (error instanceof ZodError) {
        return next(new AppError(400, "Validation failed", error.issues));
      }
      next(error);
    }
  }

  static async deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, "Unauthorized");

      const projectId = req.params.id as string;
      await ProjectService.deleteProject(userId, projectId);
      res.status(200).json({ data: { message: "Project deleted successfully" } });
    } catch (error) {
      next(error);
    }
  }
}
