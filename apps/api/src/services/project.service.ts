import { prisma } from "../db/prisma";
import { AppError } from "../utils/appError";
import { Prisma, ProjectStatus } from "../generated/prisma/client";

export class ProjectService {
  static async createProject(userId: string, data: any) {
    return prisma.project.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
  }

  static async getProjects(userId: string, search?: string, status?: ProjectStatus) {
    const where: Prisma.ProjectWhereInput = {
      userId,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (status) {
      where.status = status;
    }

    return prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async getProjectById(userId: string, projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new AppError(404, "Project not found");
    }

    return project;
  }

  static async updateProject(userId: string, projectId: string, data: any) {
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId, userId },
    });

    if (!existingProject) {
      throw new AppError(404, "Project not found");
    }

    return prisma.project.update({
      where: { id: projectId },
      data,
    });
  }

  static async deleteProject(userId: string, projectId: string) {
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId, userId },
    });

    if (!existingProject) {
      throw new AppError(404, "Project not found");
    }

    await prisma.project.delete({
      where: { id: projectId },
    });
  }
}
