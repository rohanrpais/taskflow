import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";

export const taskRoutes = Router();

taskRoutes.use(authenticate);

taskRoutes.post("/", TaskController.createTask);
taskRoutes.get("/", TaskController.getTasks);
taskRoutes.get("/:id", TaskController.getTaskById);
taskRoutes.put("/:id", TaskController.updateTask);
taskRoutes.delete("/:id", TaskController.deleteTask);
