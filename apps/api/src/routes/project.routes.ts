import { Router } from "express";
import { ProjectController } from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";

export const projectRoutes = Router();

projectRoutes.use(authenticate);

projectRoutes.post("/", ProjectController.createProject);
projectRoutes.get("/", ProjectController.getProjects);
projectRoutes.get("/:id", ProjectController.getProjectById);
projectRoutes.put("/:id", ProjectController.updateProject);
projectRoutes.delete("/:id", ProjectController.deleteProject);
