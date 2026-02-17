"use client";

import { useRouter } from "next/navigation";

import TaskForm from "@/components/TaskForm";
import { api } from "@/lib/api";
import type { TaskPayload } from "@/types/task";

export default function NewTaskPage() {
  const router = useRouter();

  const handleCreateTask = async (payload: TaskPayload) => {
    await api.createTask(payload);
    router.push("/dashboard");
    router.refresh();
  };

  const handleCancel = () => {
    router.push("/dashboard");
  };

  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Create Task</h1>
        <p className="text-sm text-slate-600">Add a new task with status and optional due date.</p>
      </header>

      <TaskForm mode="create" onSubmitTask={handleCreateTask} onCancel={handleCancel} />
    </section>
  );
}
