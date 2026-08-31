"use client";

import { useRef, useState, useTransition } from "react";
import { deleteHabit, updateHabit } from "./actions";
import { SubmitButton } from "../../../components/ui/submit-button";

type HabitActionsMenuProps = {
  habitId: string;
  habitName: string;
};

export function HabitActionsMenu({
  habitId,
  habitName,
}: HabitActionsMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function closeActions() {
    setMenuOpen(false);
    setEditing(false);
    setConfirmingDelete(false);
  }

  function openEdit() {
    setMenuOpen(false);
    setConfirmingDelete(false);
    setEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function openDeleteConfirmation() {
    setMenuOpen(false);
    setEditing(false);
    setConfirmingDelete(true);
  }

  function saveHabit(formData: FormData) {
    startTransition(async () => {
      await updateHabit(formData);
      closeActions();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`More actions for ${habitName}`}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((open) => !open)}
        className="inline-flex size-10 items-center justify-center rounded-lg border border-gray-200 text-lg font-medium leading-none text-gray-500 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        <span aria-hidden="true">⋯</span>
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-12 z-10 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={openEdit}
            className="flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-gray-50"
          >
            Edit habit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={openDeleteConfirmation}
            className="flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:bg-red-50"
          >
            Delete habit
          </button>
        </div>
      )}

      {editing && (
        <div className="absolute right-0 top-12 z-10 w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
          <form action={saveHabit} className="space-y-3">
            <input type="hidden" name="habitId" value={habitId} />
            <label
              htmlFor={`habit-name-${habitId}`}
              className="block text-sm font-medium text-gray-900"
            >
              Edit habit
            </label>
            <input
              ref={inputRef}
              id={`habit-name-${habitId}`}
              name="name"
              type="text"
              defaultValue={habitName}
              required
              maxLength={100}
              className="min-h-10 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus-visible:border-gray-900 focus-visible:ring-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeActions}
                className="min-h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
              >
                Cancel
              </button>
              <SubmitButton label="Save" pendingLabel="Saving..." />
            </div>
          </form>
        </div>
      )}

      {confirmingDelete && (
        <div className="absolute right-0 top-12 z-10 w-80 rounded-xl border border-red-200 bg-white p-4 shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            Delete “{habitName}”?
          </p>
          <p className="mt-1 text-sm text-gray-600">
            This permanently removes this habit and its completion history.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeActions}
              className="min-h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              Cancel
            </button>
            <form action={deleteHabit}>
              <input type="hidden" name="habitId" value={habitId} />
              <SubmitButton
                label="Delete"
                pendingLabel="Deleting..."
                variant="danger"
              />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
