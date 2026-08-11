export function formatCheckInLabel(value: number | null | undefined) {
  if (value == null) return "Not logged";

  const labels: Record<number, string> = {
    1: "Very low",
    2: "Low",
    3: "Okay",
    4: "Good",
    5: "Great",
  };

  return labels[value] ?? String(value);
}
