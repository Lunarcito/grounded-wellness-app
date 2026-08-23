import { expect, test } from "@playwright/test";

test("authenticated user can open the dashboard", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.getByRole("heading", { name: /welcome back/i }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Last 7 days", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Habit consistency",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Focus areas", exact: true }),
  ).toBeVisible();

  const todaySummary = page.getByTestId("today-summary");
  await expect(todaySummary).toBeVisible();
  await expect(
    todaySummary.getByRole("heading", { name: "Today", exact: true }),
  ).toBeVisible();

  await expect(todaySummary.getByText("Water", { exact: true })).toBeVisible();
  await expect(
    todaySummary.getByText("Movement", { exact: true }),
  ).toBeVisible();
});
