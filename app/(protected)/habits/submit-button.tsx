"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label?: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
};

export function SubmitButton({
  label = "Done today",
  pendingLabel = "Saving...",
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const variantClasses =
    variant === "secondary"
      ? "border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50 disabled:bg-neutral-100"
      : "bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-400";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`min-h-11 rounded-xl px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed ${variantClasses}`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
