import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import {
  mockAdminUser,
  mockDeptLeadUser,
  mockPendingLeaves,
  mockUser,
} from "../../../test/mocks/fixtures";
import { server } from "../../../test/mocks/server";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import DashboardPage from "../DashboardPage";

const BASE = "http://localhost";

// Pin time so getGreeting() returns a deterministic greeting.
beforeEach(() => vi.setSystemTime(new Date("2024-06-01T10:00:00")));
afterEach(() => vi.useRealTimers());

describe("DashboardPage", () => {
  it("renders a greeting with the user's first name", () => {
    renderWithProviders(<DashboardPage />, { user: mockUser });
    // getGreeting returns "Good morning" for 10:00
    expect(screen.getByText(/Good morning, Mark!/i)).toBeInTheDocument();
  });

  it("renders all four stat card labels", () => {
    renderWithProviders(<DashboardPage />, { user: mockUser });
    expect(screen.getByText("On Duty Today")).toBeInTheDocument();
    expect(screen.getByText("Pending Leave")).toBeInTheDocument();
    expect(screen.getByText("Overtime Alerts")).toBeInTheDocument();
    expect(screen.getByText("Active Staff")).toBeInTheDocument();
  });

  it("renders loading dashes before the stats API responds", () => {
    renderWithProviders(<DashboardPage />, { user: mockUser });
    // All four cards show '—' while isLoading is true
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThanOrEqual(4);
  });

  it("shows the stats values after the API responds", async () => {
    renderWithProviders(<DashboardPage />, { user: mockUser });
    expect(await screen.findByText("12")).toBeInTheDocument(); // onDutyToday
    expect(await screen.findByText("3")).toBeInTheDocument(); // pendingLeaves
    expect(await screen.findByText("2")).toBeInTheDocument(); // overtimeAlerts
    expect(await screen.findByText("48")).toBeInTheDocument(); // activeStaff
  });

  it("always renders the Today's Shifts panel", () => {
    renderWithProviders(<DashboardPage />, { user: mockUser });
    expect(screen.getByText("Today's Shifts")).toBeInTheDocument();
  });

  it("shows staff names in the Today's Shifts panel after data loads", async () => {
    renderWithProviders(<DashboardPage />, { user: mockUser });
    expect(await screen.findByText("Dr. Sarah Chen")).toBeInTheDocument();
  });

  it("does NOT show the Pending Leaves panel for a non-reviewer role", () => {
    renderWithProviders(<DashboardPage />, { user: mockUser }); // Receptionist
    expect(
      screen.queryByText("Pending Leave Requests"),
    ).not.toBeInTheDocument();
  });

  it("shows the Pending Leaves panel for an Admin", async () => {
    renderWithProviders(<DashboardPage />, { user: mockAdminUser });
    expect(
      await screen.findByText("Pending Leave Requests"),
    ).toBeInTheDocument();
  });

  it("shows the Pending Leaves panel for a DepartmentLead", async () => {
    renderWithProviders(<DashboardPage />, { user: mockDeptLeadUser });
    expect(
      await screen.findByText("Pending Leave Requests"),
    ).toBeInTheDocument();
  });

  it("renders pending leave entries for a DepartmentLead", async () => {
    renderWithProviders(<DashboardPage />, { user: mockDeptLeadUser });
    expect(await screen.findByText("Emma White")).toBeInTheDocument();
  });

  it("does NOT fetch pending leaves for a non-reviewer role", async () => {
    renderWithProviders(<DashboardPage />, { user: mockUser }); // Receptionist
    // Give RTK Query time to fire any pending requests
    await waitFor(() =>
      expect(screen.queryByText("Emma White")).not.toBeInTheDocument(),
    );
  });

  it("handles a null user without crashing (canReviewLeave is false)", () => {
    renderWithProviders(<DashboardPage />, { user: null });
    // No user → canReviewLeave = false branch; Today's Shifts panel still renders
    expect(screen.getByText("Today's Shifts")).toBeInTheDocument();
    expect(
      screen.queryByText("Pending Leave Requests"),
    ).not.toBeInTheDocument();
  });

  it("shows 'No shifts scheduled for today.' when today-shifts API returns empty", async () => {
    server.use(
      http.get(`${BASE}/api/v1/dashboard/today-shifts`, () =>
        HttpResponse.json([]),
      ),
    );
    renderWithProviders(<DashboardPage />, { user: mockUser });
    expect(
      await screen.findByText("No shifts scheduled for today."),
    ).toBeInTheDocument();
  });

  it("shows 'No pending leave requests.' when pending-leaves API returns empty", async () => {
    server.use(
      http.get(`${BASE}/api/v1/dashboard/pending-leaves`, () =>
        HttpResponse.json([]),
      ),
    );
    renderWithProviders(<DashboardPage />, { user: mockAdminUser });
    expect(
      await screen.findByText("No pending leave requests."),
    ).toBeInTheDocument();
  });

  it("shows a single date (no range) for a one-day pending leave", async () => {
    server.use(
      http.get(`${BASE}/api/v1/dashboard/pending-leaves`, () =>
        HttpResponse.json([
          {
            ...mockPendingLeaves[0],
            startDate: "2024-02-01",
            endDate: "2024-02-01",
            daysCount: 1,
          },
        ]),
      ),
    );
    renderWithProviders(<DashboardPage />, { user: mockAdminUser });
    await screen.findByText("Emma White");
    // Single-day: formatDateRange returns just "Feb 1", not "Feb 1 – Feb 1 (1d)"
    expect(screen.getByText(/Feb 1/)).toBeInTheDocument();
    expect(screen.queryByText(/–/)).not.toBeInTheDocument();
  });

  it("renders a leave type not in the colour map with the default badge style", async () => {
    server.use(
      http.get(`${BASE}/api/v1/dashboard/pending-leaves`, () =>
        HttpResponse.json([
          { ...mockPendingLeaves[0], leaveType: "Compassionate" },
        ]),
      ),
    );
    renderWithProviders(<DashboardPage />, { user: mockAdminUser });
    expect(await screen.findByText("Compassionate")).toBeInTheDocument();
  });
});
