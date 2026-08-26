import { archiveHabit, completeHabitForToday } from "./actions";
import { SubmitButton } from "./submit-button";
import { HabitHistory } from "./habit-history";

type HabitCardProps = {
  habit: {
    id: string;
    name: string;
    entries: { date: Date }[];
  };
  todayKey: string;
  today: Date;
  streak: number;
};

export function HabitCard({ habit, todayKey, today, streak }: HabitCardProps) {
  const completedToday = habit.entries.some(
    (entry) => entry.date.toISOString().slice(0, 10) === todayKey,
  );

  return (
    <li
      data-testid={`habit-item-${habit.id}`}
      className="flex min-h-[220px] flex-col rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-neutral-900">{habit.name}</p>

          <p className="mt-1 text-sm text-neutral-500">
            Current streak: {streak} {streak === 1 ? "day" : "days"}
            {completedToday ? " · Completed today" : ""}
          </p>

          {!completedToday && (
            <p className="mt-1 text-sm text-neutral-500">Not completed yet</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {completedToday ? (
            <span
              role="status"
              className="inline-flex min-h-9 items-center rounded-lg bg-neutral-100 px-3 text-sm font-medium text-neutral-700"
            >
              Done
            </span>
          ) : (
            <form action={completeHabitForToday}>
              <input type="hidden" name="habitId" value={habit.id} />
              <SubmitButton label="Complete" pendingLabel="..." />
            </form>
          )}

          <form action={archiveHabit}>
            <input type="hidden" name="habitId" value={habit.id} />
            <button
              type="submit"
              aria-label={`Delete ${habit.name}`}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <span aria-hidden="true">×</span>
            </button>
          </form>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <HabitHistory
          dates={habit.entries.map((entry) => entry.date)}
          today={today}
        />
      </div>
    </li>
  );
}
