const DEFAULT_TIMEZONE = "Europe/Madrid";

export function getDefaultTimezone() {
  return DEFAULT_TIMEZONE;
}

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", {
      timeZone,
    });

    return true;
  } catch {
    return false;
  }
}

export function getTodayDateInTimeZone(timeZone: string | null | undefined) {
  const safeTimeZone =
    timeZone && isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIMEZONE;

  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = dateParts.find((part) => part.type === "year")?.value;
  const month = dateParts.find((part) => part.type === "month")?.value;
  const day = dateParts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not determine the current date for the time zone.");
  }

  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

export function getTodayInTimezone(timeZone?: string | null) {
  const safeTimeZone =
    timeZone && isValidTimeZone(timeZone) ? timeZone : DEFAULT_TIMEZONE;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function getBrowserTimezone() {
  if (typeof window === "undefined") {
    return DEFAULT_TIMEZONE;
  }

  const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return isValidTimeZone(detectedTimeZone)
    ? detectedTimeZone
    : DEFAULT_TIMEZONE;
}
