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

test("authenticated user can complete a habit for today", async ({
  page,
}) => {
  await page.goto("/habits");

  const habitName = `Playwright completion test ${Date.now()}`;

  await page.getByPlaceholder("e.g. Morning walk").fill(habitName);
  await page.getByRole("button", { name: "Add habit" }).click();

  const habitItem = page.locator("li").filter({ hasText: habitName });

  await expect(habitItem).toBeVisible();
  await habitItem.getByRole("button", { name: "Done today" }).click();

  await expect(habitItem).toContainText("Completed today");
  await expect(
    habitItem.getByText("Done", { exact: true })
  ).toBeVisible();
});