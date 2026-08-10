import { expect, test as setup } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  if (!email || !password) {
    throw new Error(
      "Missing E2E_TEST_EMAIL or E2E_TEST_PASSWORD environment variables",
    );
  }

  await page.goto("/login");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();

  await expect(page).toHaveURL(/\/dashboard/, {
    timeout: 10000,
  });

  await page.context().storageState({ path: authFile });
});