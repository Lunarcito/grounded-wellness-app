"use client";

import { useState } from "react";
import { deleteHabit, updateHabit } from "./actions";
import { SubmitButton } from "./submit-button";

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

  function closeActions() {
    setMenuOpen(false);
    setEditing(false);
    setConfirmingDelete(false);
  }

  if (editing) {
    return (
      <div className="border-t border-gray-100 pt-3">
        <form action={updateHabit} className="space-y-3">
          <input type="hidden" name="habitId" value={habitId} />
          <label
            htmlFor={`habit-name-${habitId}`}
            className="text-sm font-medium text-gray-900"
          >
            Edit habit
          </label>
          <input
            id={`habit-name-${habitId}`}
            name="name"
            type="text"
            defaultValue={habitName}
            required
            maxLength={100}
            className="min-h-11 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-gray-500 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={closeActions}
              className="min-h-11 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              Cancel
            </button>
            <SubmitButton label="Save changes" pendingLabel="Saving..." />
          </div>
        </form>
      </div>
    );
  }

  if (confirmingDelete) {
    return (
      <div className="border-t border-gray-100 pt-3">
        <div className="rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-sm font-medium text-gray-900">
            Delete “{habitName}”?
          </p>
          <p className="mt-1 text-sm text-gray-600">
            This permanently removes this habit and its completion history.
          </p>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={closeActions}
              className="min-h-11 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            >
              Cancel
            </button>
            <form action={deleteHabit}>
              <input type="hidden" name="habitId" value={habitId} />
              <SubmitButton
                label="Delete habit"
                pendingLabel="Deleting..."
                variant="danger"
              />
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`More actions for ${habitName}`}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((open) => !open)}
        className="inline-flex size-10 items-center justify-center rounded-lg border border-gray-200 text-lg font-medium leading-none text-gray-600 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        <span aria-hidden="true">⋯</span>
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              setEditing(true);
            }}
            className="flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:bg-gray-50"
          >
            Edit habit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              setConfirmingDelete(true);
            }}
            className="flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:bg-red-50"
          >
            Delete habit
          </button>
        </div>
      )}
    </div>
  );
}
