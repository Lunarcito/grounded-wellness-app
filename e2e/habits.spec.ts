import { execFileSync } from "node:child_process";
import { expect, test, type Locator, type Page } from "@playwright/test";

const testHabitPrefix = "Playwright";

function cleanPlaywrightHabits() {
  const sql = `
    DELETE FROM "HabitEntry"
    WHERE "habitId" IN (
      SELECT "id"
      FROM "Habit"
      WHERE "name" LIKE '${testHabitPrefix}%'
    );

    DELETE FROM "Habit"
    WHERE "name" LIKE '${testHabitPrefix}%';
  `;

  execFileSync("npx", ["--no-install", "prisma", "db", "execute", "--stdin"], {
    cwd: process.cwd(),
    env: process.env,
    input: sql,
    stdio: ["pipe", "inherit", "inherit"],
  });
}

function getHabitItem(page: Page, habitName: string): Locator {
  return page.getByTestId(/habit-item-/).filter({ hasText: habitName });
}

async function createHabit(page: Page, habitName: string): Promise<Locator> {
  await page.getByPlaceholder("e.g. Morning walk").fill(habitName);
  await page.getByRole("button", { name: "Add habit", exact: true }).click();

  const habitItem = getHabitItem(page, habitName);
  await expect(habitItem).toBeVisible();

  return habitItem;
}

async function openHabitActions(
  page: Page,
  habitName: string,
): Promise<Locator> {
  const habitItem = getHabitItem(page, habitName);

  await habitItem
    .getByRole("button", { name: `More actions for ${habitName}` })
    .click();

  return habitItem;
}

test.beforeEach(() => {
  cleanPlaywrightHabits();
});

test.afterEach(() => {
  cleanPlaywrightHabits();
});

test("authenticated user can open habits page", async ({ page }) => {
  await page.goto("/habits");

  await expect(page).toHaveURL(/\/habits/);
  await expect(
    page.getByRole("heading", { name: "Habits", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your habits", exact: true }),
  ).toBeVisible();
  await expect(page.getByPlaceholder("e.g. Morning walk")).toBeVisible();
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

  await createHabit(page, `Playwright create ${Date.now()}`);
});

test("authenticated user can complete a habit for today", async ({ page }) => {
  await page.goto("/habits");

  const habitName = `Playwright complete ${Date.now()}`;
  const habitItem = await createHabit(page, habitName);

  await habitItem
    .getByRole("button", { name: "Complete", exact: true })
    .click();

  await expect(habitItem).toContainText("Completed today");

  const completionStatus = habitItem.getByRole("status");
  await expect(completionStatus).toBeVisible();
  await expect(completionStatus).toContainText("Completed");
});

test("authenticated user can edit a habit", async ({ page }) => {
  await page.goto("/habits");

  const habitName = `Playwright edit ${Date.now()}`;
  const updatedHabitName = `${habitName} updated`;

  await createHabit(page, habitName);
  const habitItem = await openHabitActions(page, habitName);

  await habitItem.getByRole("menuitem", { name: "Edit habit" }).click();

  const nameInput = habitItem.getByLabel("Edit habit");
  await expect(nameInput).toBeVisible();
  await nameInput.fill(updatedHabitName);
  await habitItem.getByRole("button", { name: "Save", exact: true }).click();

  const updatedHabitItem = getHabitItem(page, updatedHabitName);
  await expect(updatedHabitItem).toBeVisible();
  await expect(updatedHabitItem.getByLabel("Edit habit")).toHaveCount(0);
});

test("authenticated user can cancel habit editing", async ({ page }) => {
  await page.goto("/habits");

  const habitName = `Playwright edit cancel ${Date.now()}`;
  const habitItem = await createHabit(page, habitName);

  await openHabitActions(page, habitName);
  await habitItem.getByRole("menuitem", { name: "Edit habit" }).click();

  const nameInput = habitItem.getByLabel("Edit habit");
  await nameInput.fill(`${habitName} changed`);
  await habitItem.getByRole("button", { name: "Cancel", exact: true }).click();

  await expect(habitItem).toContainText(habitName);
  await expect(nameInput).toHaveCount(0);
});

test("authenticated user can cancel habit deletion", async ({ page }) => {
  await page.goto("/habits");

  const habitName = `Playwright delete cancel ${Date.now()}`;
  const habitItem = await createHabit(page, habitName);

  await openHabitActions(page, habitName);
  await habitItem.getByRole("menuitem", { name: "Delete habit" }).click();

  await expect(habitItem).toContainText(`Delete “${habitName}”?`);
  await habitItem.getByRole("button", { name: "Cancel", exact: true }).click();

  await expect(habitItem).toBeVisible();
  await expect(habitItem).not.toContainText(`Delete “${habitName}”?`);
});

test("authenticated user can delete a habit", async ({ page }) => {
  await page.goto("/habits");

  const habitName = `Playwright delete ${Date.now()}`;

  await createHabit(page, habitName);
  const habitItem = await openHabitActions(page, habitName);

  await habitItem.getByRole("menuitem", { name: "Delete habit" }).click();
  await expect(habitItem).toContainText(`Delete “${habitName}”?`);

  await habitItem.getByRole("button", { name: "Delete", exact: true }).click();

  await expect(getHabitItem(page, habitName)).toHaveCount(0);
});
