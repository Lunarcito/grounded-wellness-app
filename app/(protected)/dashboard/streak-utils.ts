export type HabitCompletionEntry = {
  date: Date;
  completed: boolean;
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getUtcDayOffset(date: Date, daysAgo: number) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - daysAgo,
    ),
  );
}

export function calculateActiveStreak(
  entries: HabitCompletionEntry[],
  now = new Date(),
) {
  const completedDates = new Set(
    entries
      .filter((entry) => entry.completed)
      .map((entry) => toDateKey(entry.date)),
  );

  const todayKey = toDateKey(now);

  if (!completedDates.has(todayKey)) {
    return 0;
  }

  let streak = 0;

  for (let daysAgo = 0; daysAgo < 365; daysAgo += 1) {
    const dateKey = toDateKey(getUtcDayOffset(now, daysAgo));

    if (!completedDates.has(dateKey)) {
      break;
    }

    streak += 1;
  }

  return streak;
}
