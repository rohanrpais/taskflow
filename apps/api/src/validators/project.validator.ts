import { z } from "zod";
import { ProjectStatus } from "../generated/prisma/client";

const projectBaseSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().optional().nullable(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.NOT_STARTED),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

export const createProjectSchema = projectBaseSchema.refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be earlier than start date",
  path: ["endDate"],
});

export const updateProjectSchema = projectBaseSchema.partial();

export const projectQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});
