"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import ErrorBanner from "@/components/ErrorBanner";
import LoadingSpinner from "@/components/LoadingSpinner";
import TaskForm from "@/components/TaskForm";
import { api } from "@/lib/api";
import { getAuthErrorMessage } from "@/lib/auth";
import type { Task, TaskPayload } from "@/types/task";

export default function EditTaskPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const taskId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTask = useCallback(async () => {
    if (!taskId) {
      setError("Task id is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextTask = await api.getTaskById(taskId);
      setTask(nextTask);
    } catch (loadError) {
      setError(getAuthErrorMessage(loadError, "Unable to load task."));
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    void loadTask();
  }, [loadTask]);

  const handleUpdateTask = async (payload: TaskPayload) => {
    if (!taskId) {
      throw new Error("Task id is missing.");
    }

    await api.updateTask(taskId, payload);
    router.push("/dashboard");
    router.refresh();
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-10">
        <LoadingSpinner label="Loading task..." />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-4">
        <ErrorBanner message={error ?? "Task not found."} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadTask}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 transition hover:bg-slate-50"
          >
            Retry
          </button>
          <Link
            href="/dashboard"
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Edit Task</h1>
        <p className="text-sm text-slate-600">Update task details and save your changes.</p>
      </header>

      <TaskForm mode="edit" initialTask={task} onSubmitTask={handleUpdateTask} onCancel={handleCancel} />
    </section>
  );
}
