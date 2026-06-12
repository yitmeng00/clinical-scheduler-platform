import type { Page } from "@playwright/test";

const MOCK_LOGIN_RESPONSE = {
  accessToken: "mock-access-token",
  expiresIn: 900,
  staff: {
    id: 8,
    fullName: "Mark Stevens",
    email: "m.stevens@hospital.org",
    role: "Receptionist",
    department: "Front Desk",
    initials: "MS",
  },
};

const MOCK_ADMIN_LOGIN_RESPONSE = {
  ...MOCK_LOGIN_RESPONSE,
  staff: {
    id: 12,
    fullName: "Admin User",
    email: "admin@hospital.org",
    role: "Admin",
    department: "Emergency",
    initials: "AU",
  },
};

/** Intercept all API routes with sensible default mock responses. */
export async function mockApiRoutes(page: Page) {
  await page.route("**/api/v1/auth/login", (route) =>
    route.fulfill({ json: MOCK_LOGIN_RESPONSE }),
  );
  await page.route("**/api/v1/auth/logout", (route) =>
    route.fulfill({ status: 204 }),
  );
  await page.route("**/api/v1/auth/refresh", (route) =>
    route.fulfill({ json: MOCK_LOGIN_RESPONSE }),
  );
  await page.route("**/api/v1/dashboard/stats", (route) =>
    route.fulfill({
      json: { onDutyToday: 12, pendingLeaves: 3, overtimeAlerts: 2, activeStaff: 48 },
    }),
  );
  await page.route("**/api/v1/dashboard/today-shifts", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route("**/api/v1/dashboard/pending-leaves", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route("**/api/v1/leaves**", (route) => route.fulfill({ json: [] }));
  await page.route("**/api/v1/departments**", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.route("**/api/v1/staff**", (route) => route.fulfill({ json: [] }));
  await page.route("**/hubs/**", (route) => route.abort());
}

/** Log in via the login form and wait for the dashboard to load. */
export async function loginAs(
  page: Page,
  email = "m.stevens@hospital.org",
  password = "password123",
) {
  await page.goto("/");
  await page.getByPlaceholder("you@hospital.org").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
}

/** Log in as Admin. */
export async function loginAsAdmin(page: Page) {
  await page.route("**/api/v1/auth/login", (route) =>
    route.fulfill({ json: MOCK_ADMIN_LOGIN_RESPONSE }),
  );
  await loginAs(page, "admin@hospital.org", "password123");
}
