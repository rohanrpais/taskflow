import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { requestLogger } from "./middleware/requestLogger";
import { apiRouter } from "./routes";

export const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: false,
  }),
);
app.use(requestLogger);
app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);
