"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel: string;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
};

export function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const variantClasses =
    variant === "secondary"
      ? "border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 disabled:bg-neutral-100"
      : variant === "danger"
        ? "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300"
        : "bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-400";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed ${variantClasses} ${className}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
