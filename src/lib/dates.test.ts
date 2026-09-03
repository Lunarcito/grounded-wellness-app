import { describe, expect, it } from "vitest";
import {
  getDefaultTimezone,
  getTodayDateInTimeZone,
  getTodayInTimezone,
  isValidTimeZone,
} from "./dates";

describe("dates", () => {
  it("uses Europe/Madrid as the default timezone", () => {
    expect(getDefaultTimezone()).toBe("Europe/Madrid");
  });

  it("accepts valid IANA timezone identifiers", () => {
    expect(isValidTimeZone("Europe/Madrid")).toBe(true);
    expect(isValidTimeZone("America/Toronto")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
  });

  it("rejects an invalid timezone identifier", () => {
    expect(isValidTimeZone("Not/A-Timezone")).toBe(false);
  });

  it("returns a YYYY-MM-DD key for the selected timezone", () => {
    const dateKey = getTodayInTimezone("Europe/Madrid");

    expect(dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("falls back to Europe/Madrid when no timezone is provided", () => {
    expect(getTodayInTimezone()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(getTodayInTimezone(null)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a Date at midnight UTC for the user's local calendar date", () => {
    const date = getTodayDateInTimeZone("Europe/Madrid");

    expect(date).toBeInstanceOf(Date);
    expect(date.getUTCHours()).toBe(0);
    expect(date.getUTCMinutes()).toBe(0);
    expect(date.getUTCSeconds()).toBe(0);
    expect(date.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/);
  });

  it("uses the fallback timezone for an invalid timezone", () => {
    const fallbackKey = getTodayInTimezone("Europe/Madrid");
    const invalidKey = getTodayInTimezone("Not/A-Timezone");

    expect(invalidKey).toBe(fallbackKey);
  });
});
