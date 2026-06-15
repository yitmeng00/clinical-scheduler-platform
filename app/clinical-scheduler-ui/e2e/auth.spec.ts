import { expect, test } from "@playwright/test";

import { loginAs, mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

test.describe("Login page", () => {
  test("renders the Sign in form", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByPlaceholder("you@hospital.org")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("shows validation error when submitting an empty form", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
  });

  test("shows a server error on invalid credentials", async ({ page }) => {
    await page.route("**/api/v1/auth/login", (route) =>
      route.fulfill({
        status: 401,
        json: { title: "Invalid credentials" },
      }),
    );
    await page.goto("/");
    await page.getByPlaceholder("you@hospital.org").fill("wrong@hospital.org");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("navigates to /dashboard after successful login", async ({ page }) => {
    await loginAs(page);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("dashboard shows a greeting after login", async ({ page }) => {
    await loginAs(page);
    await expect(page.getByRole("heading", { name: /Mark/ })).toBeVisible();
  });
});

test.describe("Protected routes", () => {
  test("redirects unauthenticated users to /login when accessing /dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    // AppContainer checks isAuthenticated and redirects to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
