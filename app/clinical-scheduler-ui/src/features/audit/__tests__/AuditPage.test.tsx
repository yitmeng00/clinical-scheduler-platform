import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { mockAdminUser, mockAuditEntry } from "../../../test/mocks/fixtures";
import { server } from "../../../test/mocks/server";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import AuditPage from "../AuditPage";

const BASE = "http://localhost";

describe("AuditPage", () => {
  it("renders the 'Audit Log' heading", () => {
    renderWithProviders(<AuditPage />, { user: mockAdminUser });
    expect(
      screen.getByRole("heading", { name: "Audit Log" }),
    ).toBeInTheDocument();
  });

  it("shows '0 events in this period' when no entries", async () => {
    renderWithProviders(<AuditPage />, { user: mockAdminUser });
    expect(
      await screen.findByText("0 events in this period"),
    ).toBeInTheDocument();
  });

  it("renders 7 days, 30 days, and 90 days preset buttons", () => {
    renderWithProviders(<AuditPage />, { user: mockAdminUser });
    expect(screen.getByRole("button", { name: "7 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "30 days" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "90 days" })).toBeInTheDocument();
  });

  it("renders the category filter select defaulting to 'All Categories'", () => {
    renderWithProviders(<AuditPage />, { user: mockAdminUser });
    expect(screen.getByDisplayValue("All Categories")).toBeInTheDocument();
  });

  it("shows empty state when no audit events exist", async () => {
    renderWithProviders(<AuditPage />, { user: mockAdminUser });
    expect(
      await screen.findByText("No audit events in this period."),
    ).toBeInTheDocument();
  });

  it("renders an audit entry after data loads", async () => {
    server.use(
      http.get(`${BASE}/api/v1/audit`, () =>
        HttpResponse.json([mockAuditEntry]),
      ),
    );
    renderWithProviders(<AuditPage />, { user: mockAdminUser });
    expect(await screen.findByText("Mark Stevens")).toBeInTheDocument();
    expect(screen.getByText("Annual Leave")).toBeInTheDocument();
  });

  it("shows the category badge for a Leave entry", async () => {
    server.use(
      http.get(`${BASE}/api/v1/audit`, () =>
        HttpResponse.json([mockAuditEntry]),
      ),
    );
    renderWithProviders(<AuditPage />, { user: mockAdminUser });
    await screen.findByText("Mark Stevens");
    // "Leave" appears as both the category badge and text inline — use getAllByText
    expect(screen.getAllByText("Leave").length).toBeGreaterThan(0);
  });

  it("shows the action badge for a 'submitted' entry", async () => {
    server.use(
      http.get(`${BASE}/api/v1/audit`, () =>
        HttpResponse.json([mockAuditEntry]),
      ),
    );
    renderWithProviders(<AuditPage />, { user: mockAdminUser });
    await screen.findByText("Mark Stevens");
    // "submitted" appears as the action badge and inline text
    expect(screen.getAllByText("submitted").length).toBeGreaterThan(0);
  });

  it("changes the active preset when a different period button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AuditPage />, { user: mockAdminUser });
    const btn30 = screen.getByRole("button", { name: "30 days" });
    await user.click(btn30);
    // After clicking, 30 days button should have the accent (active) style
    expect(btn30.className).toContain("bg-accent");
  });
});
