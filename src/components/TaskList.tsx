"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatDate } from "@/lib/auth";
import type { Task, TaskStatus } from "@/types/task";

type TaskListProps = {
  tasks: Task[];
  onDeleteTask: (taskId: string) => Promise<void>;
};

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-amber-100 text-amber-700",
  done: "bg-emerald-100 text-emerald-700",
};

const statusLabel: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export default function TaskList({ tasks, onDeleteTask }: TaskListProps) {
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const filteredTasks = useMemo(() => {
    if (filter === "all") {
      return tasks;
    }

    return tasks.filter((task) => task.status === filter);
  }, [tasks, filter]);

  const handleDelete = async (task: Task) => {
    if (!task._id) {
      console.error("Task is missing _id field:", task);
      alert("Cannot delete task: missing ID");
      return;
    }

    const confirmed = window.confirm(`Delete task \"${task.title}\"?`);
    if (!confirmed) {
      return;
    }

    setDeletingTaskId(task._id);
    try {
      await onDeleteTask(task._id);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setDeletingTaskId(null);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Your Tasks</h2>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          Status
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value as "all" | TaskStatus)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
            <option value="all">All</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-600">
          {tasks.length === 0 ? "No tasks yet." : "No tasks match this filter."}
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredTasks.map((task) => (
            <li key={task._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-medium text-slate-900">{task.title}</h3>
                  {task.description ? <p className="text-sm text-slate-600">{task.description}</p> : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[task.status]}`}>
                      {statusLabel[task.status]}
                    </span>
                    <span className="text-xs text-slate-500">Due: {formatDate(task.dueDate)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/tasks/${task._id}/edit`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-800 transition hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(task)}
                    disabled={deletingTaskId === task._id}
                    className="rounded-md border border-red-400 text-red-600 px-3 py-1.5 text-sm transition hover:bg-red-50 hover:border-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
                  >
                    {deletingTaskId === task._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
