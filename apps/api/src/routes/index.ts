import { Router } from "express";
import { healthRoutes } from "./healthRoutes";
import { authRoutes } from "./auth.routes";
import { projectRoutes } from "./project.routes";
import { taskRoutes } from "./task.routes";
import { dashboardRoutes } from "./dashboard.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/auth", authRoutes);
apiRouter.use("/projects", projectRoutes);
apiRouter.use("/tasks", taskRoutes);
apiRouter.use("/dashboard", dashboardRoutes);

