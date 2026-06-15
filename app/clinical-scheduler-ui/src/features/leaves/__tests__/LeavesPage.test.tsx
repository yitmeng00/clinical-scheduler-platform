import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  mockAdminUser,
  mockApprovedLeave,
  mockDeptLeadUser,
  mockLeaveRequest,
  mockUser,
} from "../../../test/mocks/fixtures";
import { server } from "../../../test/mocks/server";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import LeavesPage from "../LeavesPage";

const BASE = "http://localhost";

describe("LeavesPage", () => {
  it("renders the Leave Requests heading", () => {
    renderWithProviders(<LeavesPage />, { user: mockUser });
    expect(
      screen.getByRole("heading", { name: "Leave Requests" }),
    ).toBeInTheDocument();
  });

  it("shows 'No pending approvals' when there are none", async () => {
    renderWithProviders(<LeavesPage />, { user: mockUser });
    expect(await screen.findByText("No pending approvals")).toBeInTheDocument();
  });

  it("shows pending count when there are pending leaves", async () => {
    server.use(
      http.get(`${BASE}/api/v1/leaves`, () =>
        HttpResponse.json([mockLeaveRequest]),
      ),
    );
    renderWithProviders(<LeavesPage />, { user: mockDeptLeadUser });
    expect(await screen.findByText("1 pending approval")).toBeInTheDocument();
  });

  it("shows empty state text when there are no leave requests", async () => {
    renderWithProviders(<LeavesPage />, { user: mockUser });
    expect(await screen.findByText(/No.*leave requests/i)).toBeInTheDocument();
  });

  it("renders leave rows when data is loaded", async () => {
    server.use(
      http.get(`${BASE}/api/v1/leaves`, () =>
        HttpResponse.json([mockLeaveRequest, mockApprovedLeave]),
      ),
    );
    renderWithProviders(<LeavesPage />, { user: mockUser });
    expect(await screen.findByText("Mark Stevens")).toBeInTheDocument();
    expect(screen.getByText("Emma White")).toBeInTheDocument();
  });

  it("shows 'Request Leave' button for non-Admin roles", () => {
    renderWithProviders(<LeavesPage />, { user: mockUser });
    expect(
      screen.getByRole("button", { name: /Request Leave/i }),
    ).toBeInTheDocument();
  });

  it("does NOT show 'Request Leave' button for Admin", () => {
    renderWithProviders(<LeavesPage />, { user: mockAdminUser });
    expect(
      screen.queryByRole("button", { name: /Request Leave/i }),
    ).not.toBeInTheDocument();
  });

  it("opens the SubmitLeaveModal when Request Leave is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LeavesPage />, { user: mockUser });
    await user.click(screen.getByRole("button", { name: /Request Leave/i }));
    expect(
      screen.getByRole("heading", { name: "Request Leave" }),
    ).toBeInTheDocument();
  });

  it("closes the SubmitLeaveModal when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LeavesPage />, { user: mockUser });
    await user.click(screen.getByRole("button", { name: /Request Leave/i }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByRole("heading", { name: "Request Leave" }),
    ).not.toBeInTheDocument();
  });

  it("shows All / Pending / Approved / Rejected tabs", () => {
    renderWithProviders(<LeavesPage />, { user: mockUser });
    for (const label of ["All", "Pending", "Approved", "Rejected"]) {
      expect(
        screen.getByRole("button", { name: new RegExp(label) }),
      ).toBeInTheDocument();
    }
  });

  it("filters to Pending tab correctly", async () => {
    server.use(
      http.get(`${BASE}/api/v1/leaves`, () =>
        HttpResponse.json([mockLeaveRequest, mockApprovedLeave]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<LeavesPage />, { user: mockUser });
    await screen.findByText("Mark Stevens");
    await user.click(screen.getByRole("button", { name: /^Pending/ }));
    expect(screen.getByText("Mark Stevens")).toBeInTheDocument();
    expect(screen.queryByText("Emma White")).not.toBeInTheDocument();
  });

  it("filters to Approved tab correctly", async () => {
    server.use(
      http.get(`${BASE}/api/v1/leaves`, () =>
        HttpResponse.json([mockLeaveRequest, mockApprovedLeave]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<LeavesPage />, { user: mockUser });
    await screen.findByText("Mark Stevens");
    await user.click(screen.getByRole("button", { name: /^Approved/ }));
    expect(screen.getByText("Emma White")).toBeInTheDocument();
    expect(screen.queryByText("Mark Stevens")).not.toBeInTheDocument();
  });

  it("shows 'Review' button for a reviewer on pending leaves", async () => {
    server.use(
      http.get(`${BASE}/api/v1/leaves`, () =>
        HttpResponse.json([mockLeaveRequest]),
      ),
    );
    renderWithProviders(<LeavesPage />, { user: mockDeptLeadUser });
    expect(
      await screen.findByRole("button", { name: "Review" }),
    ).toBeInTheDocument();
  });

  it("shows 'View' button for non-reviewer on pending leaves", async () => {
    server.use(
      http.get(`${BASE}/api/v1/leaves`, () =>
        HttpResponse.json([mockLeaveRequest]),
      ),
    );
    renderWithProviders(<LeavesPage />, { user: mockUser });
    expect(
      await screen.findByRole("button", { name: "View" }),
    ).toBeInTheDocument();
  });

  it("opens ReviewLeaveModal when a row action button is clicked", async () => {
    server.use(
      http.get(`${BASE}/api/v1/leaves`, () =>
        HttpResponse.json([mockLeaveRequest]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<LeavesPage />, { user: mockUser });
    await user.click(await screen.findByRole("button", { name: "View" }));
    expect(
      screen.getByRole("heading", { name: "Annual Leave" }),
    ).toBeInTheDocument();
  });

  it("closes ReviewLeaveModal when Close is clicked", async () => {
    server.use(
      http.get(`${BASE}/api/v1/leaves`, () =>
        HttpResponse.json([mockLeaveRequest]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<LeavesPage />, { user: mockUser });
    await user.click(await screen.findByRole("button", { name: "View" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(
      screen.queryByRole("button", { name: "Close" }),
    ).not.toBeInTheDocument();
  });

  it("shows empty state for Rejected tab when no rejected leaves", async () => {
    server.use(
      http.get(`${BASE}/api/v1/leaves`, () =>
        HttpResponse.json([mockLeaveRequest]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<LeavesPage />, { user: mockUser });
    await screen.findByText("Mark Stevens");
    await user.click(screen.getByRole("button", { name: /^Rejected/ }));
    expect(screen.getByText(/No rejected leave requests/i)).toBeInTheDocument();
  });
});
