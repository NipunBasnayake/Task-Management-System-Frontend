import type { HTMLAttributes } from "react";

type LoadingSpinnerProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
};

export default function LoadingSpinner({ label = "Loading...", className = "", ...props }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`.trim()} {...props}>
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600"
        aria-hidden="true"
      />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
}
