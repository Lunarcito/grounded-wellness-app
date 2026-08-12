import { execFileSync } from "node:child_process";
import { expect, test } from "@playwright/test";

function cleanPlaywrightHabits() {
  const sql = `
    DELETE FROM "HabitEntry"
    WHERE "habitId" IN (
      SELECT "id"
      FROM "Habit"
      WHERE "name" LIKE 'Playwright%'
    );

    DELETE FROM "Habit"
    WHERE "name" LIKE 'Playwright%';
  `;

  execFileSync("npx", ["--no-install", "prisma", "db", "execute", "--stdin"], {
    cwd: process.cwd(),
    env: process.env,
    input: sql,
    stdio: ["pipe", "inherit", "inherit"],
  });
}

test.beforeAll(() => {
  cleanPlaywrightHabits();
});

test.afterAll(() => {
  cleanPlaywrightHabits();
});

test("authenticated user can open habits page", async ({ page }) => {
  await page.goto("/habits");

  await expect(page).toHaveURL(/\/habits/);
  await expect(
    page.getByRole("heading", { name: "Habits", exact: true }),
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

test("authenticated user can complete a habit for today", async ({ page }) => {
  await page.goto("/habits");

  const habitName = `Playwright completion test ${Date.now()}`;

  await page.getByPlaceholder("e.g. Morning walk").fill(habitName);
  await page.getByRole("button", { name: "Add habit" }).click();

  const habitItem = page.locator("li").filter({ hasText: habitName });

  await expect(habitItem).toBeVisible();
  await habitItem.getByRole("button", { name: "Done today" }).click();

  await expect(habitItem).toContainText("Completed today");
  await expect(habitItem.getByText("Done", { exact: true })).toBeVisible();
});

test("authenticated user can archive a habit", async ({ page }) => {
  await page.goto("/habits");

  const habitName = `Playwright archive test ${Date.now()}`;

  await page.getByPlaceholder("e.g. Morning walk").fill(habitName);
  await page.getByRole("button", { name: "Add habit" }).click();

  const habitItem = page.locator("li").filter({ hasText: habitName });

  await expect(habitItem).toBeVisible();
  await habitItem.getByRole("button", { name: "Archive" }).click();

  await expect(page.getByText(habitName, { exact: true })).not.toBeVisible();
});
