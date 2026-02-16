"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ErrorBanner from "@/components/ErrorBanner";
import LoadingSpinner from "@/components/LoadingSpinner";
import TaskList from "@/components/TaskList";
import { api } from "@/lib/api";
import { getAuthErrorMessage } from "@/lib/auth";
import type { Task } from "@/types/task";
import { Plus } from "lucide-react";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextTasks = await api.getTasks();
      setTasks(nextTasks);
    } catch (loadError) {
      setError(getAuthErrorMessage(loadError, "Unable to load tasks."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const onDeleteTask = async (taskId: string) => {
    if (!taskId || typeof taskId !== "string" || taskId.trim() === "") {
      setError("Cannot delete task: invalid ID");
      throw new Error("Invalid task ID");
    }

    const previousTasks = tasks;

    setTasks((current) => current.filter((task) => task._id !== taskId));

    try {
      await api.deleteTask(taskId);
    } catch (deleteError) {
      setTasks(previousTasks);
      setError(getAuthErrorMessage(deleteError, "Unable to delete task."));
      throw deleteError;
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-600">Review your task list and keep work moving.</p>
        </div>

        <Link
          href="/tasks/new"
          className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-100"
        >
          <Plus className="h-4 w-4 text-white" />
          <span className="text-white">Create Task</span>
        </Link>
      </header>

      {error ? (
        <div className="space-y-3">
          <ErrorBanner message={error} />
          <button
            type="button"
            onClick={loadTasks}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 transition hover:bg-slate-50"
          >
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-10">
          <LoadingSpinner label="Loading tasks..." />
        </div>
      ) : (
        <TaskList tasks={tasks} onDeleteTask={onDeleteTask} />
      )}
    </section>
  );
}
