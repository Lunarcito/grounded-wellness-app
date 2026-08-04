import { describe, expect, it } from "vitest";
import {
  calculateStreakForHabit,
  getDateDaysAgoUtc,
  getTodayDateUtc,
} from "./utils";

describe("habit utils", () => {
  it("returns today's date at UTC midnight", () => {
    const now = new Date("2026-08-04T15:30:00.000Z");

    expect(getTodayDateUtc(now).toISOString()).toBe("2026-08-04T00:00:00.000Z");
  });

  it("returns a UTC date days ago", () => {
    const now = new Date("2026-08-04T15:30:00.000Z");

    expect(getDateDaysAgoUtc(2, now).toISOString()).toBe(
      "2026-08-02T00:00:00.000Z",
    );
  });

  it("calculates a streak from consecutive dates", () => {
    const now = new Date("2026-08-04T15:30:00.000Z");
    const entryDates = [
      new Date("2026-08-04T12:00:00.000Z"),
      new Date("2026-08-03T12:00:00.000Z"),
      new Date("2026-08-02T12:00:00.000Z"),
    ];

    expect(calculateStreakForHabit(entryDates, now)).toBe(3);
  });

  it("stops streak when a day is missing", () => {
    const now = new Date("2026-08-04T15:30:00.000Z");
    const entryDates = [
      new Date("2026-08-04T12:00:00.000Z"),
      new Date("2026-08-02T12:00:00.000Z"),
    ];

    expect(calculateStreakForHabit(entryDates, now)).toBe(1);
  });
});
