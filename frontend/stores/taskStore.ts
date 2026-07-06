import { create } from "zustand";
import api from "@/lib/api";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  tags: string[];
  position: number;
  created_at: string;
  updated_at: string;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (dueDate: string | null) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: number, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  reorder: (orderedIds: number[], status: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (dueDate) => {
    set({ loading: true, error: null });
    try {
      const params = dueDate ? { due_date: dueDate } : {};
      const { data } = await api.get("/tasks/", { params });
      set({ tasks: data, loading: false });
    } catch {
      set({ error: "Failed to load tasks", loading: false });
    }
  },

  createTask: async (taskData) => {
    const { data } = await api.post("/tasks/", taskData);
    set((s) => ({ tasks: [...s.tasks, data] }));
  },

  updateTask: async (id, taskData) => {
    const { data } = await api.put(`/tasks/${id}/`, taskData);
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? data : t)),
    }));
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}/`);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  reorder: async (orderedIds, status) => {
    const prev = get().tasks;
    set((s) => ({
      tasks: s.tasks.map((t) =>
        orderedIds.includes(t.id)
          ? { ...t, status: status as Task["status"], position: orderedIds.indexOf(t.id) }
          : t
      ),
    }));
    try {
      await api.post("/tasks/reorder/", { ordered_ids: orderedIds, status });
    } catch {
      set({ tasks: prev });
    }
  },
}));
