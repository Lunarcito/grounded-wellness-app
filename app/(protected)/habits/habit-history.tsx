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

  return (
    <div aria-label="Habit history for the last 30 days" className="mt-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Last 30 days
        </p>
        <p className="text-xs text-neutral-500">
          {days.filter((day) => day.completed).length} completed
        </p>
      </div>

      <div className="mt-3 grid grid-cols-10 gap-1.5">
        {days.map((day) => (
          <span
            key={dateKey(day.date)}
            title={`${day.completed ? "Completed" : "Not completed"} on ${dateKey(day.date)}`}
            aria-label={`${day.completed ? "Completed" : "Not completed"} on ${dateKey(day.date)}`}
            className={`aspect-square rounded-sm border ${
              day.completed
                ? "border-neutral-900 bg-neutral-900"
                : "border-neutral-200 bg-neutral-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
