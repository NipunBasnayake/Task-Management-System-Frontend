import type { ApiErrorPayload } from "@/types/api";
import { ApiError } from "@/types/api";
import type { Task, TaskPayload } from "@/types/task";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type RequestOptions = RequestInit & {
  skipRefresh?: boolean;
  retryAttempted?: boolean;
};

type UnknownObject = Record<string, unknown>;

let refreshPromise: Promise<void> | null = null;

function isObject(value: unknown): value is UnknownObject {
  return typeof value === "object" && value !== null;
}

function toApiError(message: string, status: number, payload?: unknown): ApiError {
  const details = isObject(payload) ? (payload as ApiErrorPayload).details ?? payload : payload;
  return new ApiError(message, status, details);
}

async function parseJsonSafe(response: Response): Promise<unknown | null> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!isObject(payload)) {
    return fallback;
  }

  const { message, error } = payload as ApiErrorPayload;
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

function extractTasks(payload: unknown): Task[] {
  if (Array.isArray(payload)) {
    return normalizeTaskIds(payload as unknown as Task[]);
  }

  if (isObject(payload)) {
    if (Array.isArray(payload.tasks)) {
      return normalizeTaskIds(payload.tasks as unknown as Task[]);
    }

    if (Array.isArray(payload.data)) {
      return normalizeTaskIds(payload.data as unknown as Task[]);
    }
  }

  return [];
}

function normalizeTaskIds(tasks: Task[]): Task[] {
  return tasks.map((task) => {
    // Handle cases where API might return 'id' instead of '_id'
    if (!task._id && (task as any).id) {
      return { ...task, _id: (task as any).id };
    }
    return task;
  });
}

function extractTask(payload: unknown): Task {
  let task: Task;

  if (isObject(payload)) {
    if (isObject(payload.task)) {
      task = payload.task as unknown as Task;
    } else if (isObject(payload.data)) {
      task = payload.data as unknown as Task;
    } else {
      task = payload as unknown as Task;
    }
  } else {
    task = payload as unknown as Task;
  }

  // Handle cases where API might return 'id' instead of '_id'
  if (!task._id && (task as any).id) {
    return { ...task, _id: (task as any).id };
  }

  return task;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const payload = await parseJsonSafe(response);
        const message = getErrorMessage(payload, "Unable to refresh session.");
        throw toApiError(message, response.status, payload);
      }
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipRefresh = false, retryAttempted = false, headers, body, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...rest,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
        ...(headers ?? {}),
      },
      body,
    });
  } catch (error) {
    throw toApiError(
      error instanceof Error ? error.message : "Network request failed.",
      0,
      error,
    );
  }

  const payload = await parseJsonSafe(response);

  if (response.status === 401 && !skipRefresh && !retryAttempted && endpoint !== "/auth/refresh") {
    try {
      await refreshSession();
      return request<T>(endpoint, {
        ...options,
        skipRefresh: true,
        retryAttempted: true,
      });
    } catch {
      redirectToLogin();
      throw new ApiError("Session expired. Please log in again.", 401);
    }
  }

  if (!response.ok) {
    const fallback = `Request failed with status ${response.status}`;
    throw toApiError(getErrorMessage(payload, fallback), response.status, payload);
  }

  if (response.status === 204) {
    return null as T;
  }

  return payload as T;
}

export const api = {
  async register(input: { email: string; password: string }) {
    await request<unknown>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
      skipRefresh: true,
    });
  },

  async login(input: { email: string; password: string }) {
    await request<unknown>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
      skipRefresh: true,
    });
  },

  async logout() {
    await request<unknown>("/auth/logout", {
      method: "POST",
      skipRefresh: true,
    });
  },

  async checkSession() {
    await request<unknown>("/tasks", {
      method: "GET",
    });
  },

  async getTasks() {
    const payload = await request<unknown>("/tasks", {
      method: "GET",
    });

    return extractTasks(payload);
  },

  async getTaskById(id: string) {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new ApiError("Invalid task id", 400);
    }

    try {
      const payload = await request<unknown>(`/tasks/${encodeURIComponent(id)}`, {
        method: "GET",
      });

      return extractTask(payload);
    } catch (error) {
      if (!(error instanceof ApiError) || ![400, 404, 405].includes(error.status)) {
        throw error;
      }

      const tasks = await this.getTasks();
      const found = tasks.find((task) => task._id === id);
      if (!found) {
        throw new ApiError("Task not found.", 404);
      }

      return found;
    }
  },

  async createTask(input: TaskPayload) {
    const payload = await request<unknown>("/tasks", {
      method: "POST",
      body: JSON.stringify(input),
    });

    return extractTask(payload);
  },

  async updateTask(id: string, input: TaskPayload) {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new ApiError("Invalid task id", 400);
    }

    const payload = await request<unknown>(`/tasks/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });

    return extractTask(payload);
  },

  async deleteTask(id: string) {
    if (!id || typeof id !== "string" || id.trim() === "") {
      throw new ApiError("Invalid task id", 400);
    }

    await request<unknown>(`/tasks/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },
};
