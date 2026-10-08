import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import rateLimit from "express-rate-limit";

export const authRoutes = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: { message: "Too many authentication attempts, please try again later." } }
});

authRoutes.post("/register", authLimiter, AuthController.register);
authRoutes.post("/login", authLimiter, AuthController.login);
authRoutes.post("/logout", authenticate, AuthController.logout);
authRoutes.get("/me", authenticate, AuthController.getMe);
