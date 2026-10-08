import { z } from "zod";
import { TaskStatus, TaskPriority } from "../generated/prisma/client";

const taskBaseSchema = z.object({
  name: z.string().trim().min(1, "Task name is required"),
  description: z.string().trim().optional().nullable(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  dueDate: z.coerce.date(),
});

export const createTaskSchema = taskBaseSchema.extend({
  projectId: z.string().uuid("Invalid project ID"),
});

export const updateTaskSchema = taskBaseSchema.partial();

export const taskQuerySchema = z.object({
  projectId: z.string().uuid("Invalid project ID").optional(),
  search: z.string().trim().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
});
