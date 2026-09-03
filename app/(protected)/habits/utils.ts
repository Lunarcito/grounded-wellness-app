function getDateKey(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not determine a date key.");
  }

  return `${year}-${month}-${day}`;
}

function getDateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function addDays(dateKey: string, days: number) {
  const date = getDateFromKey(dateKey);

  date.setUTCDate(date.getUTCDate() + days);

  return getDateKey(date, "UTC");
}

export function getTodayDateUtc(now = new Date(), timezone = "UTC") {
  return getDateFromKey(getDateKey(now, timezone));
}

export function getDateDaysAgoUtc(
  daysAgo: number,
  now = new Date(),
  timezone = "UTC",
) {
  const todayKey = getDateKey(now, timezone);

  return getDateFromKey(addDays(todayKey, -daysAgo));
}

export function calculateStreakForHabit(
  entryDates: Date[],
  now = new Date(),
  timezone = "UTC",
) {
  const completedDates = new Set(
    entryDates.map((date) => getDateKey(date, timezone)),
  );

  const todayKey = getDateKey(now, timezone);
  const completedToday = completedDates.has(todayKey);
  let streak = 0;

  for (let daysAgo = completedToday ? 0 : 1; daysAgo < 30; daysAgo += 1) {
    const dateKey = addDays(todayKey, -daysAgo);

    if (!completedDates.has(dateKey)) {
      break;
    }

    streak += 1;
  }

  return streak;
}
