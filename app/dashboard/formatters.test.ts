import { describe, expect, it } from "vitest";
import { formatCheckInLabel } from "./formatters";

describe("formatCheckInLabel", () => {
  it('returns "Not logged" for null or undefined values', () => {
    expect(formatCheckInLabel(null)).toBe("Not logged");
    expect(formatCheckInLabel(undefined)).toBe("Not logged");
  });

  it("returns the expected label for known scores", () => {
    expect(formatCheckInLabel(1)).toBe("Very low");
    expect(formatCheckInLabel(3)).toBe("Okay");
    expect(formatCheckInLabel(5)).toBe("Great");
  });

  it("falls back to the raw number for unknown scores", () => {
    expect(formatCheckInLabel(6)).toBe("6");
  });
});
