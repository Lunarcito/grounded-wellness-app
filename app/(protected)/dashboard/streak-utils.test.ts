import { describe, expect, it } from "vitest";
import { calculateActiveStreak } from "./streak-utils";

const now = new Date("2026-08-29T12:00:00.000Z");

function entry(date: string, completed = true) {
  return {
    date: new Date(`${date}T00:00:00.000Z`),
    completed,
  };
}

describe("calculateActiveStreak", () => {
  it("counts completed days consecutively through today", () => {
    expect(
      calculateActiveStreak(
        [entry("2026-08-29"), entry("2026-08-28"), entry("2026-08-27")],
        now,
      ),
    ).toBe(3);
  });

  it("returns zero when today is incomplete", () => {
    expect(
      calculateActiveStreak(
        [entry("2026-08-28"), entry("2026-08-27"), entry("2026-08-29", false)],
        now,
      ),
    ).toBe(0);
  });

  it("stops at the first incomplete day", () => {
    expect(
      calculateActiveStreak(
        [entry("2026-08-29"), entry("2026-08-28"), entry("2026-08-26")],
        now,
      ),
    ).toBe(2);
  });

  it("returns zero with no completed entries", () => {
    expect(calculateActiveStreak([], now)).toBe(0);
  });

  it("works across month boundaries", () => {
    const monthBoundaryNow = new Date("2026-09-01T12:00:00.000Z");

    expect(
      calculateActiveStreak(
        [entry("2026-09-01"), entry("2026-08-31"), entry("2026-08-30")],
        monthBoundaryNow,
      ),
    ).toBe(3);
  });
});
