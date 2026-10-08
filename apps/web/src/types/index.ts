export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
}
