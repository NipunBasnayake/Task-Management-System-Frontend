"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
}: ConfirmationModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative mx-4 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {isDangerous && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            )}
            <div className="flex-1">
              <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
                {title}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{message}</p>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`rounded-md px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                isDangerous
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {isLoading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
