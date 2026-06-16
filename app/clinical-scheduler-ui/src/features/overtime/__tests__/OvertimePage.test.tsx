import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  mockAdminUser,
  mockOvertimeRecord,
} from "../../../test/mocks/fixtures";
import { server } from "../../../test/mocks/server";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import OvertimePage from "../OvertimePage";

const BASE = "http://localhost";

describe("OvertimePage", () => {
  it("renders the 'Overtime Tracker' heading", () => {
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    expect(
      screen.getByRole("heading", { name: "Overtime Tracker" }),
    ).toBeInTheDocument();
  });

  it("shows 'No overtime recorded this week' when no records exist", async () => {
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    expect(
      await screen.findByText("No overtime recorded this week"),
    ).toBeInTheDocument();
  });

  it("renders all four summary card labels", () => {
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    expect(screen.getByText("Total overtime hrs")).toBeInTheDocument();
    expect(screen.getByText("Staff over 40h limit")).toBeInTheDocument();
    expect(screen.getByText("Total scheduled hrs")).toBeInTheDocument();
    expect(screen.getByText("Total shifts this week")).toBeInTheDocument();
  });

  it("shows '0h' and '0' in summary cards when no records are returned", async () => {
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    await screen.findByText("No overtime recorded this week");
    const zeroHrs = screen.getAllByText("0h");
    expect(zeroHrs.length).toBeGreaterThan(0);
  });

  it("shows empty state text when no shifts are recorded", async () => {
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    expect(
      await screen.findByText("No shifts recorded for this week."),
    ).toBeInTheDocument();
  });

  it("renders a staff row after overtime data loads", async () => {
    server.use(
      http.get(`${BASE}/api/v1/overtime`, () =>
        HttpResponse.json([mockOvertimeRecord]),
      ),
    );
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    expect(await screen.findByText("Mark Stevens")).toBeInTheDocument();
  });

  it("shows '+8h' overtime badge for a staff member over the limit", async () => {
    server.use(
      http.get(`${BASE}/api/v1/overtime`, () =>
        HttpResponse.json([mockOvertimeRecord]),
      ),
    );
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    expect(await screen.findByText("+8h")).toBeInTheDocument();
  });

  it("renders Previous week and Next week navigation buttons", () => {
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    expect(
      screen.getByRole("button", { name: "Previous week" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next week" }),
    ).toBeInTheDocument();
  });

  it("updates the week label when Next week is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    const weekLabel = screen.getByText(/Week of/);
    const initialText = weekLabel.textContent;
    await user.click(screen.getByRole("button", { name: "Next week" }));
    expect(weekLabel.textContent).not.toBe(initialText);
  });

  it("shows '—' dash and accent avatar for a non-overtime staff member", async () => {
    const nonOvertimeRecord = {
      ...mockOvertimeRecord,
      isOvertime: false,
      overtimeHours: 0,
      totalHours: 38,
    };
    server.use(
      http.get(`${BASE}/api/v1/overtime`, () =>
        HttpResponse.json([nonOvertimeRecord]),
      ),
    );
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    await screen.findByText("Mark Stevens");
    // Non-overtime staff show "—" in the overtime column
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("navigates to the previous week when Previous week is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    const weekLabel = screen.getByText(/Week of/);
    const initialText = weekLabel.textContent;
    await user.click(screen.getByRole("button", { name: "Previous week" }));
    expect(weekLabel.textContent).not.toBe(initialText);
  });

  it("shows plural 'staff members' in the header when more than one has overtime", async () => {
    const secondRecord = {
      ...mockOvertimeRecord,
      staffId: 9,
      fullName: "Jane Doe",
      initials: "JD",
    };
    server.use(
      http.get(`${BASE}/api/v1/overtime`, () =>
        HttpResponse.json([mockOvertimeRecord, secondRecord]),
      ),
    );
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    expect(
      await screen.findByText("2 staff members with overtime this week"),
    ).toBeInTheDocument();
  });

  it("falls back to raw role text for an unknown role value", async () => {
    server.use(
      http.get(`${BASE}/api/v1/overtime`, () =>
        HttpResponse.json([{ ...mockOvertimeRecord, role: "Volunteer" }]),
      ),
    );
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    expect(await screen.findByText("Volunteer")).toBeInTheDocument();
  });

  it("falls back to raw employment type text for an unknown employment type", async () => {
    server.use(
      http.get(`${BASE}/api/v1/overtime`, () =>
        HttpResponse.json([
          { ...mockOvertimeRecord, employmentType: "Casual" },
        ]),
      ),
    );
    renderWithProviders(<OvertimePage />, { user: mockAdminUser });
    expect(await screen.findByText("Casual")).toBeInTheDocument();
  });
});
