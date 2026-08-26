type HabitHistoryProps = {
  dates: Date[];
  today: Date;
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
export function HabitHistory({ dates, today }: HabitHistoryProps) {
  const completedDates = new Set(dates.map(dateKey));

  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - (29 - index));

    return {
      date,
      completed: completedDates.has(dateKey(date)),
    };
  });

  const completedCount = days.filter((day) => day.completed).length;

  return (
    <div
      aria-label="Habit history for the last 30 days"
      className="w-fit max-w-full"
    >
      <div className="flex items-center justify-between gap-6">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Last 30 days
        </p>

        <p className="shrink-0 text-xs text-neutral-500">
          {completedCount} of {days.length} days
        </p>
      </div>

      <div className="mt-2 grid w-fit grid-cols-10 gap-1">
        {days.map((day) => (
          <span
            key={dateKey(day.date)}
            title={`${day.completed ? "Completed" : "Not completed"} on ${dateKey(day.date)}`}
            aria-label={`${day.completed ? "Completed" : "Not completed"} on ${dateKey(day.date)}`}
            className={`size-3 rounded-[2px] border ${
              day.completed
                ? "border-neutral-700 bg-neutral-700"
                : "border-neutral-200 bg-neutral-50"
            }`}
          />
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[2px] border border-neutral-700 bg-neutral-700"
          />
          Completed
        </span>

        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[2px] border border-neutral-200 bg-neutral-50"
          />
          Not completed
        </span>
      </div>
    </div>
  );
}
