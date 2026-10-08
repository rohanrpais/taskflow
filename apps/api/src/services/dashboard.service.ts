import { prisma } from "../db/prisma";
import { ProjectStatus, TaskStatus } from "../generated/prisma/client";

export class DashboardService {
  static async getDashboardStats(userId: string) {
    const [totalProjects, projectsInProgress, totalTasks, completedTasks, pendingTasks] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: ProjectStatus.IN_PROGRESS } }),
      prisma.task.count({ where: { project: { userId } } }),
      prisma.task.count({ where: { project: { userId }, status: TaskStatus.COMPLETED } }),
      prisma.task.count({ where: { project: { userId }, status: TaskStatus.PENDING } }),
    ]);

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
    };
  }
}
