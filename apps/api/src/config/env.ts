import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"], {
    message: "NODE_ENV must be one of: development, test, production",
  }),
  PORT: z.coerce
    .number({ error: "PORT must be a number" })
    .int()
    .min(1)
    .max(65535),
  CORS_ORIGIN: z
    .string()
    .trim()
    .min(1, "CORS_ORIGIN is required")
    .refine(
      (value) =>
        !value
          .split(",")
          .map((origin) => origin.trim())
          .includes("*"),
      { message: "CORS_ORIGIN cannot use a wildcard (*)" },
    ),
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().trim().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().trim().min(1, "JWT_EXPIRES_IN is required").default("24h"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  const corsOrigins = parsed.data.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (corsOrigins.length === 0) {
    throw new Error("Invalid environment configuration: CORS_ORIGIN is empty");
  }

  return {
    ...parsed.data,
    corsOrigins,
  };
}

export const env = loadEnv();
export type Env = typeof env;
