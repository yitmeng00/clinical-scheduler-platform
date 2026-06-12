import { expect, test } from "@playwright/test";

import { loginAs, mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
  await loginAs(page);
});

test.describe("Notification bell", () => {
  test("bell button is visible on the dashboard", async ({ page }) => {
    await expect(page.getByRole("button").first()).toBeVisible();
  });

  test("no badge is shown when there are no unread notifications", async ({
    page,
  }) => {
    // The badge only renders when unread > 0
    await expect(page.locator("text=/^[1-9]/")).not.toBeVisible();
  });

  test("clicking the bell opens the notification dropdown", async ({
    page,
  }) => {
    // The bell is the only icon button in the top bar
    await page.getByRole("button").first().click();
    await expect(page.getByText("Notifications")).toBeVisible();
  });

  test("dropdown shows the empty state when there are no notifications", async ({
    page,
  }) => {
    await page.getByRole("button").first().click();
    await expect(page.getByText("No notifications yet.")).toBeVisible();
  });

  test("clicking the backdrop closes the dropdown", async ({ page }) => {
    await page.getByRole("button").first().click();
    await expect(page.getByText("Notifications")).toBeVisible();
    // Click the fixed backdrop overlay
    await page.locator("div.fixed.inset-0").click({ force: true });
    await expect(page.getByText("Notifications")).not.toBeVisible();
  });
});
