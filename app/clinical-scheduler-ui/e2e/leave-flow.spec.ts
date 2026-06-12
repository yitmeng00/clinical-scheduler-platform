import { expect, test } from "@playwright/test";

import { loginAs, loginAsAdmin, mockApiRoutes } from "./helpers";

test.beforeEach(async ({ page }) => {
  await mockApiRoutes(page);
});

test.describe("Leave Requests page — staff member", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page); // Receptionist
    await page.goto("/leaves");
  });

  test("renders the Leave Requests heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Leave Requests" }),
    ).toBeVisible();
  });

  test("shows the Request Leave button for non-Admin roles", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: "Request Leave" }),
    ).toBeVisible();
  });

  test("shows the empty state when there are no leaves", async ({ page }) => {
    await expect(
      page.getByText("No leave requests."),
    ).toBeVisible();
  });

  test("opens the Request Leave modal when the button is clicked", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Request Leave" }).click();
    await expect(
      page.getByRole("heading", { name: "Request Leave" }),
    ).toBeVisible();
  });

  test("modal has the required form fields", async ({ page }) => {
    await page.getByRole("button", { name: "Request Leave" }).click();
    await expect(page.getByLabel("Leave Type")).toBeVisible();
    await expect(page.getByLabel("Start Date")).toBeVisible();
    await expect(page.getByLabel("End Date")).toBeVisible();
    await expect(page.getByLabel("Reason")).toBeVisible();
  });

  test("shows validation errors when submitting an empty form", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Request Leave" }).click();
    // Clear the pre-filled start date then try to submit
    await page.getByLabel("Start Date").fill("");
    await page.getByRole("button", { name: "Submit Request" }).click();
    await expect(page.getByText("Start date is required")).toBeVisible();
  });

  test("submits the leave request and closes the modal", async ({ page }) => {
    await page.route("**/api/v1/leaves", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({ status: 201, json: { id: 99 } });
      }
      return route.fulfill({ json: [] });
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);

    await page.getByRole("button", { name: "Request Leave" }).click();
    await page.getByLabel("Start Date").fill(dateStr);
    await page.getByLabel("End Date").fill(dateStr);
    await page
      .getByPlaceholder("Briefly explain the reason for your leave…")
      .fill("Annual leave");
    await page.getByRole("button", { name: "Submit Request" }).click();

    // Modal should close after successful submission
    await expect(
      page.getByRole("heading", { name: "Request Leave" }),
    ).not.toBeVisible();
  });

  test("closes the modal when Cancel is clicked", async ({ page }) => {
    await page.getByRole("button", { name: "Request Leave" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(
      page.getByRole("heading", { name: "Request Leave" }),
    ).not.toBeVisible();
  });
});

test.describe("Leave Requests page — Admin", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/leaves");
  });

  test("does NOT show the Request Leave button for Admin", async ({
    page,
  }) => {
    await expect(
      page.getByRole("button", { name: "Request Leave" }),
    ).not.toBeVisible();
  });

  test("shows 'Review' button for pending leaves", async ({ page }) => {
    await page.route("**/api/v1/leaves**", (route) =>
      route.fulfill({
        json: [
          {
            id: 1,
            staffFullName: "Emma White",
            staffInitials: "EW",
            staffDepartment: "Emergency",
            leaveType: "Annual",
            startDate: "2024-02-01",
            endDate: "2024-02-05",
            daysCount: 5,
            reason: "Holiday",
            status: "Pending",
            submittedAt: "2024-01-10T10:00:00Z",
          },
        ],
      }),
    );
    await page.reload();
    await expect(page.getByRole("button", { name: "Review" })).toBeVisible();
  });
});
