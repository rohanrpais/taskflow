import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get("/", DashboardController.getDashboard);
