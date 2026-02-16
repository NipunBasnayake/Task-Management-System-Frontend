"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import ErrorBanner from "@/components/ErrorBanner";
import { getAuthErrorMessage } from "@/lib/auth";
import type { Task, TaskPayload, TaskStatus } from "@/types/task";

const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(120, "Title must be 120 characters or fewer."),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or fewer.")
    .optional()
    .or(z.literal("")),
  status: z.enum(["todo", "in_progress", "done"]),
  dueDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => {
      if (!value) {
        return true;
      }

      return !Number.isNaN(new Date(value).getTime());
    }, "Please choose a valid due date."),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

type TaskFormProps = {
  mode: "create" | "edit";
  initialTask?: Task;
  onSubmitTask: (payload: TaskPayload) => Promise<void>;
  onCancel?: () => void;
};

const statusOptions: Array<{ label: string; value: TaskStatus }> = [
  { label: "To do", value: "todo" },
  { label: "In progress", value: "in_progress" },
  { label: "Done", value: "done" },
];

function toDateInputValue(value?: string | null): string {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

export default function TaskForm({ mode, initialTask, onSubmitTask, onCancel }: TaskFormProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initialTask?.title ?? "",
      description: initialTask?.description ?? "",
      status: initialTask?.status ?? "todo",
      dueDate: toDateInputValue(initialTask?.dueDate),
    },
  });

  const submit = async (values: TaskFormValues) => {
    setFormError(null);

    try {
      await onSubmitTask({
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        status: values.status,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      });
    } catch (error) {
      setFormError(getAuthErrorMessage(error, "Unable to save task."));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      noValidate
    >
      {formError ? <ErrorBanner message={formError} /> : null}

      <div className="space-y-1.5">
        <label htmlFor="title" className="block text-sm font-medium text-slate-800">
          Title
        </label>
        <input
          id="title"
          type="text"
          {...register("title")}
          disabled={isSubmitting}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          placeholder="Ship production build"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title ? (
          <p id="title-error" className="text-sm text-red-600">
            {errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="block text-sm font-medium text-slate-800">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          {...register("description")}
          disabled={isSubmitting}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          placeholder="Optional details"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        {errors.description ? (
          <p id="description-error" className="text-sm text-red-600">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="status" className="block text-sm font-medium text-slate-800">
            Status
          </label>
          <select
            id="status"
            {...register("status")}
            disabled={isSubmitting}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="dueDate" className="block text-sm font-medium text-slate-800">
            Due date
          </label>
          <input
            id="dueDate"
            type="date"
            {...register("dueDate")}
            disabled={isSubmitting}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            aria-invalid={Boolean(errors.dueDate)}
            aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
          />
          {errors.dueDate ? (
            <p id="dueDate-error" className="text-sm text-red-600">
              {errors.dueDate.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-teal-300"
        >
          {mode === "create" ? (
            <Plus className="h-4 w-4" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {isSubmitting ? (mode === "create" ? "Saving..." : "Updating...") : mode === "create" ? "Create Task" : "Save Changes"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
