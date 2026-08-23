import { test, expect } from "@playwright/test";

test("authenticated user can submit a daily check-in", async ({ page }) => {
  await page.goto("/check-in");

  await expect(page).toHaveURL(/\/check-in/);
  await expect(
    page.getByRole("heading", { name: "How are you feeling today?" }),
  ).toBeVisible();

  await page.getByLabel("Mood").selectOption("4");
  await page.getByLabel("Energy").selectOption("3");
  await page.getByLabel("Sleep quality").selectOption("4");
  await page.getByLabel("Stress").selectOption("2");
  await page.getByLabel("Water today (ml)").fill("2000");
  await page.getByLabel("Movement today (min)").fill("30");

  await page
    .getByRole("button", { name: "Save check-in", exact: true })
    .click();

  await expect(page).toHaveURL(/\/dashboard/);

  const todaySummary = page.getByTestId("today-summary");
  await expect(todaySummary).toBeVisible();
  await expect(todaySummary.getByText("Water", { exact: true })).toBeVisible();
  await expect(
    todaySummary.getByText("Movement", { exact: true }),
  ).toBeVisible();

  await expect(
    todaySummary.getByRole("link", { name: "View today's habits" }),
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
    await page.goto("/check-in");
    await expect(page).toHaveURL(/\/login/);
  });
});

test("authenticated user can update today's check-in", async ({ page }) => {
  await page.goto("/check-in");

  await page.getByLabel("Mood").selectOption("5");
  await page.getByLabel("Energy").selectOption("4");
  await page.getByLabel("Sleep quality").selectOption("3");
  await page.getByLabel("Stress").selectOption("1");
  await page.getByLabel("Water today (ml)").fill("2500");
  await page.getByLabel("Movement today (min)").fill("45");

  await page.getByRole("button", { name: "Save check-in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.goto("/check-in");

  await expect(page.getByLabel("Mood")).toHaveValue("5");
  await expect(page.getByLabel("Energy")).toHaveValue("4");
  await expect(page.getByLabel("Sleep quality")).toHaveValue("3");
  await expect(page.getByLabel("Stress")).toHaveValue("1");
  await expect(page.getByLabel("Water today (ml)")).toHaveValue("2500");
  await expect(page.getByLabel("Movement today (min)")).toHaveValue("45");
});
