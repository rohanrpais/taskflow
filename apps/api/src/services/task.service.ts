import { prisma } from "../db/prisma";
import { AppError } from "../utils/appError";
import { Prisma, TaskStatus, TaskPriority } from "../generated/prisma/client";

export class TaskService {
  static async createTask(userId: string, data: any) {
    // Verify that the project belongs to the authenticated user
    const project = await prisma.project.findUnique({
      where: { id: data.projectId, userId },
    });

    if (!project) {
      throw new AppError(404, "Project not found");
    }

    return prisma.task.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
      },
    });
  }

  static async getTasks(userId: string, query: { projectId?: string; search?: string; status?: TaskStatus; priority?: TaskPriority }) {
    const where: Prisma.TaskWhereInput = {
      project: {
        userId,
      },
    };

    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.search) {
      where.name = {
        contains: query.search,
        mode: "insensitive",
      };
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }

    return prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async getTaskById(userId: string, taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task || task.project.userId !== userId) {
      throw new AppError(404, "Task not found");
    }

    // Exclude the loaded project relation if desired, or return as is
    const { project: _, ...safeTask } = task;
    return safeTask;
  }

  static async updateTask(userId: string, taskId: string, data: any) {
    // First find the task and verify ownership
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task || task.project.userId !== userId) {
      throw new AppError(404, "Task not found");
    }

    return prisma.task.update({
      where: { id: taskId },
      data: {
        name: data.name,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
      },
    });
  }

  static async deleteTask(userId: string, taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task || task.project.userId !== userId) {
      throw new AppError(404, "Task not found");
    }

    await prisma.task.delete({
      where: { id: taskId },
    });
  }
}
