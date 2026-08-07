import { test, expect } from "@playwright/test";

test("authenticated user can open the dashboard", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard/);

  await expect(
    page.getByText("Wellness dashboard", { exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: /welcome back,/i })
  ).toBeVisible();

  await expect(
    page.getByText("Setup completed", { exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole("link", { name: "New daily check-in" })
  ).toBeVisible();

  await expect(
    page.getByText("Water goal", { exact: true })
  ).toBeVisible();

  await expect(
    page.getByText("Movement goal", { exact: true })
  ).toBeVisible();

  await expect(
    page.getByText("Main goal", { exact: true })
  ).toBeVisible();

  await expect(
    page.getByText("Profile", { exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Focus areas", exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Today", exact: true })
  ).toBeVisible();
});

test("authenticated user can open a new daily check-in", async ({
  page,
}) => {
  await page.goto("/dashboard");

  await page
    .getByRole("link", { name: "New daily check-in" })
    .click();

  await expect(page).toHaveURL(/\/check-in/);
});