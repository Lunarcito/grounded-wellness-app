import { completeHabitForToday } from "./actions";
import { HabitActionsMenu } from "./habit-actions-menu";
import { HabitHistory } from "./habit-history";
import { SubmitButton } from "./submit-button";

type HabitCardProps = {
  habit: {
    id: string;
    name: string;
    entries: { date: Date }[];
  };
  today: Date;
  todayKey: string;
  streak: number;
};

export function HabitCard({ habit, today, todayKey, streak }: HabitCardProps) {
  const completedToday = habit.entries.some(
    (entry) => entry.date.toISOString().slice(0, 10) === todayKey,
  );

  const streakLabel =
    streak > 0
      ? `${streak} day${streak === 1 ? "" : "s"} streak`
      : "No active streak";

  return (
    <li
      data-testid={`habit-item-${habit.id}`}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">{habit.name}</p>
            <p className="mt-1 text-sm text-gray-500">
              {streakLabel}
              <span aria-hidden="true"> · </span>
              {completedToday ? "Completed today" : "Not completed yet"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {completedToday ? (
              <span
                role="status"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-sm font-medium text-emerald-700"
              >
                <span aria-hidden="true">✓</span>
                Completed
              </span>
            ) : (
              <form action={completeHabitForToday}>
                <input type="hidden" name="habitId" value={habit.id} />
                <SubmitButton label="Complete" pendingLabel="Completing..." />
              </form>
            )}

            <HabitActionsMenu habitId={habit.id} habitName={habit.name} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <HabitHistory
            dates={habit.entries.map((entry) => entry.date)}
            today={today}
          />
        </div>
      </div>
    </li>
  );
}
