// ------------------------------------------------------------------
// TypeScript types matching the existing backend API responses.
// Derived from apps/api Prisma schema and controller response shapes.
// ------------------------------------------------------------------

// --- Enums (match Prisma enums) ---

export type ProjectStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

// --- Entities ---

export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
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
  priority: TaskPriority;
  status: TaskStatus;
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

// --- API response wrappers ---

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    details?: unknown[];
  };
}

// --- Auth-specific ---

export interface AuthPayload {
  user: User;
  token: string;
}
