import { apiClient } from "./client";
import type { User, Project, Task, DashboardStats } from "../types";

export const api = {
  auth: {
    register: (data: any) => apiClient.post("/auth/register", data),
    login: (data: any) => apiClient.post("/auth/login", data).then((res) => res.data),
    logout: () => apiClient.post("/auth/logout"),
    me: () => apiClient.get<{ data: User }>("/auth/me").then((res) => res.data),
  },
  projects: {
    getAll: (params?: { search?: string; status?: string }) => {
      const cleanParams: Record<string, string> = {};
      if (params?.search) cleanParams.search = params.search;
      if (params?.status) cleanParams.status = params.status;
      return apiClient.get<{ data: Project[] }>("/projects", { params: cleanParams }).then((res) => res.data);
    },
    getById: (id: string) => apiClient.get<{ data: Project }>(`/projects/${id}`).then((res) => res.data),
    create: (data: Partial<Project>) => apiClient.post<{ data: Project }>("/projects", data).then((res) => res.data),
    update: (id: string, data: Partial<Project>) => apiClient.put<{ data: Project }>(`/projects/${id}`, data).then((res) => res.data),
    delete: (id: string) => apiClient.delete(`/projects/${id}`).then((res) => res.data),
  },
  tasks: {
    getAll: (params?: { projectId?: string; search?: string; status?: string; priority?: string }) => {
      const cleanParams: Record<string, string> = {};
      if (params?.projectId) cleanParams.projectId = params.projectId;
      if (params?.search) cleanParams.search = params.search;
      if (params?.status) cleanParams.status = params.status;
      if (params?.priority) cleanParams.priority = params.priority;
      return apiClient.get<{ data: Task[] }>("/tasks", { params: cleanParams }).then((res) => res.data);
    },
    getById: (id: string) => apiClient.get<{ data: Task }>(`/tasks/${id}`).then((res) => res.data),
    create: (data: Partial<Task>) => apiClient.post<{ data: Task }>("/tasks", data).then((res) => res.data),
    update: (id: string, data: Partial<Task>) => apiClient.put<{ data: Task }>(`/tasks/${id}`, data).then((res) => res.data),
    delete: (id: string) => apiClient.delete(`/tasks/${id}`).then((res) => res.data),
  },
  dashboard: {
    getStats: () => apiClient.get<{ data: DashboardStats }>("/dashboard").then((res) => res.data),
  },
};
