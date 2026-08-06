import { test, expect } from "@playwright/test";

test("authenticated user can open habits page", async ({ page }) => {
  await page.goto("/habits");

  await expect(page).toHaveURL(/\/habits/);
  await expect(
    page.getByRole("heading", { name: "Habits", exact: true })
  ).toBeVisible();
});