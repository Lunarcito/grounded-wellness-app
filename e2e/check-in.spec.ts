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
  await expect(page.getByText("Water:", { exact: false })).toBeVisible();
  await expect(page.getByText("Movement:", { exact: false })).toBeVisible();
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
