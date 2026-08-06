import { test, expect } from "@playwright/test";

test("authenticated user can open habits page", async ({ page }) => {
  await page.goto("/habits");

  await expect(page).toHaveURL(/\/habits/);
  await expect(
    page.getByRole("heading", { name: "Habits", exact: true })
  ).toBeVisible();
});

test.describe("unauthenticated access", () => {
  test.use({
    storageState: {
      cookies: [],
      origins: [],
    },
  });

  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/habits");

    await expect(page).toHaveURL(/\/login/);
  });
});

test("authenticated user can create a habit", async ({ page }) => {
  await page.goto("/habits");

  const habitName = `Playwright habit ${Date.now()}`;

  await page.getByPlaceholder("e.g. Morning walk").fill(habitName);
  await page.getByRole("button", { name: "Add habit" }).click();

  await expect(page.getByText(habitName, { exact: true })).toBeVisible();
});