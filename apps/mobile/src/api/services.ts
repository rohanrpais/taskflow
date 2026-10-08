// ------------------------------------------------------------------
// Thin wrappers around the REST API endpoints.
// Mirror the web app's api/services.ts — same backend, same contract.
// ------------------------------------------------------------------

import { apiClient } from "./client";
import type {
  User,
  Project,
  Task,
  DashboardStats,
  AuthPayload,
} from "../types";

export const api = {
  auth: {
    register: (data: { fullName: string; email: string; password: string }) =>
      apiClient
        .post<{ data: AuthPayload }>("/auth/register", data)
        .then((r) => r.data),
    login: (data: { email: string; password: string }) =>
      apiClient
        .post<{ data: AuthPayload }>("/auth/login", data)
        .then((r) => r.data),
    logout: () => apiClient.post("/auth/logout"),
    me: () =>
      apiClient.get<{ data: User }>("/auth/me").then((r) => r.data),
  },

  projects: {
    getAll: (params?: { search?: string; status?: string }) => {
      const clean: Record<string, string> = {};
      if (params?.search) clean.search = params.search;
      if (params?.status) clean.status = params.status;
      return apiClient
        .get<{ data: Project[] }>("/projects", { params: clean })
        .then((r) => r.data);
    },
    getById: (id: string) =>
      apiClient
        .get<{ data: Project }>(`/projects/${id}`)
        .then((r) => r.data),
  },

  tasks: {
    getAll: (params?: {
      projectId?: string;
      search?: string;
      status?: string;
      priority?: string;
    }) => {
      const clean: Record<string, string> = {};
      if (params?.projectId) clean.projectId = params.projectId;
      if (params?.search) clean.search = params.search;
      if (params?.status) clean.status = params.status;
      if (params?.priority) clean.priority = params.priority;
      return apiClient
        .get<{ data: Task[] }>("/tasks", { params: clean })
        .then((r) => r.data);
    },
    getById: (id: string) =>
      apiClient.get<{ data: Task }>(`/tasks/${id}`).then((r) => r.data),
    create: (data: {
      projectId: string;
      name: string;
      description?: string;
      priority?: string;
      status?: string;
      dueDate: string;
    }) =>
      apiClient.post<{ data: Task }>("/tasks", data).then((r) => r.data),
    update: (id: string, data: Partial<Task>) =>
      apiClient
        .put<{ data: Task }>(`/tasks/${id}`, data)
        .then((r) => r.data),
    delete: (id: string) =>
      apiClient.delete(`/tasks/${id}`).then((r) => r.data),
  },

  dashboard: {
    getStats: () =>
      apiClient
        .get<{ data: DashboardStats }>("/dashboard")
        .then((r) => r.data),
  },
};
