export function getTodayDateUtc(now = new Date()) {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function getDateDaysAgoUtc(daysAgo: number, now = new Date()) {
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysAgo,
    ),
  );
}

export function calculateStreakForHabit(entryDates: Date[], now = new Date()) {
  const dates = new Set(
    entryDates.map((date) => date.toISOString().slice(0, 10)),
  );

  let streak = 0;

  for (let i = 0; i < 30; i += 1) {
    const dateKey = getDateDaysAgoUtc(i, now).toISOString().slice(0, 10);

    if (!dates.has(dateKey)) {
      break;
    }

    streak += 1;
  }

  return streak;
}
