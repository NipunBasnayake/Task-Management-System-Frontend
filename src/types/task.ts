export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string | null;
}
