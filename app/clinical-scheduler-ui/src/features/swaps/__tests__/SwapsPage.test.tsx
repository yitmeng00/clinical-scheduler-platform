import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  mockAdminUser,
  mockSwapRequest,
  mockUser,
} from "../../../test/mocks/fixtures";
import { server } from "../../../test/mocks/server";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import SwapsPage from "../SwapsPage";

const BASE = "http://localhost";

describe("SwapsPage", () => {
  it("renders the 'Shift Swaps' heading", () => {
    renderWithProviders(<SwapsPage />, { user: mockUser });
    expect(
      screen.getByRole("heading", { name: "Shift Swaps" }),
    ).toBeInTheDocument();
  });

  it("shows 'No pending actions' when no swap requests exist", async () => {
    renderWithProviders(<SwapsPage />, { user: mockUser });
    expect(await screen.findByText("No pending actions")).toBeInTheDocument();
  });

  it("shows 'Request Swap' button for non-Admin", () => {
    renderWithProviders(<SwapsPage />, { user: mockUser });
    expect(
      screen.getByRole("button", { name: /Request Swap/ }),
    ).toBeInTheDocument();
  });

  it("does NOT show 'Request Swap' button for Admin", () => {
    renderWithProviders(<SwapsPage />, { user: mockAdminUser });
    expect(
      screen.queryByRole("button", { name: /Request Swap/ }),
    ).not.toBeInTheDocument();
  });

  it("renders All, Pending, Approved, and Rejected tab buttons", () => {
    renderWithProviders(<SwapsPage />, { user: mockUser });
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pending" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Approved" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Rejected" }),
    ).toBeInTheDocument();
  });

  it("shows empty state when no swaps are returned", async () => {
    renderWithProviders(<SwapsPage />, { user: mockUser });
    expect(await screen.findByText("No swap requests.")).toBeInTheDocument();
  });

  it("renders swap row with requester and requestee names after data loads", async () => {
    server.use(
      http.get(`${BASE}/api/v1/swaps`, () =>
        HttpResponse.json([mockSwapRequest]),
      ),
    );
    renderWithProviders(<SwapsPage />, { user: mockUser });
    expect(await screen.findByText("Emma White")).toBeInTheDocument();
    expect(screen.getByText("Mark Stevens")).toBeInTheDocument();
  });

  it("shows 'Awaiting Response' status badge for PendingRequestee", async () => {
    server.use(
      http.get(`${BASE}/api/v1/swaps`, () =>
        HttpResponse.json([mockSwapRequest]),
      ),
    );
    renderWithProviders(<SwapsPage />, { user: mockUser });
    expect(await screen.findByText("Awaiting Response")).toBeInTheDocument();
  });

  it("shows 'Respond' action when current user is the requestee on a PendingRequestee swap", async () => {
    server.use(
      http.get(`${BASE}/api/v1/swaps`, () =>
        HttpResponse.json([mockSwapRequest]),
      ),
    );
    // mockSwapRequest.requesteeId = 8 = mockUser.id
    renderWithProviders(<SwapsPage />, { user: mockUser });
    expect(
      await screen.findByRole("button", { name: "Respond" }),
    ).toBeInTheDocument();
  });

  it("shows 'Review' action for Admin on a PendingAdmin swap", async () => {
    server.use(
      http.get(`${BASE}/api/v1/swaps`, () =>
        HttpResponse.json([{ ...mockSwapRequest, status: "PendingAdmin" }]),
      ),
    );
    renderWithProviders(<SwapsPage />, { user: mockAdminUser });
    expect(
      await screen.findByRole("button", { name: "Review" }),
    ).toBeInTheDocument();
  });

  it("opens RequestSwapModal when 'Request Swap' is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SwapsPage />, { user: mockUser });
    await user.click(screen.getByRole("button", { name: /Request Swap/ }));
    expect(
      screen.getByRole("heading", { name: "Request Shift Swap" }),
    ).toBeInTheDocument();
  });

  it("opens ViewSwapModal when a swap action button is clicked", async () => {
    server.use(
      http.get(`${BASE}/api/v1/swaps`, () =>
        HttpResponse.json([mockSwapRequest]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<SwapsPage />, { user: mockUser });
    await user.click(await screen.findByRole("button", { name: "Respond" }));
    expect(
      screen.getByRole("heading", { name: "Shift Swap" }),
    ).toBeInTheDocument();
  });

  it("switches to Pending tab and shows filtered empty state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SwapsPage />, { user: mockUser });
    await user.click(screen.getByRole("button", { name: "Pending" }));
    expect(
      await screen.findByText("No pending swap requests."),
    ).toBeInTheDocument();
  });

  it("closes RequestSwapModal when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SwapsPage />, { user: mockUser });
    await user.click(screen.getByRole("button", { name: /Request Swap/ }));
    expect(
      screen.getByRole("heading", { name: "Request Shift Swap" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByRole("heading", { name: "Request Shift Swap" }),
    ).not.toBeInTheDocument();
  });

  it("closes ViewSwapModal when Close is clicked", async () => {
    server.use(
      http.get(`${BASE}/api/v1/swaps`, () =>
        HttpResponse.json([mockSwapRequest]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<SwapsPage />, { user: mockUser });
    await user.click(await screen.findByRole("button", { name: "Respond" }));
    expect(
      screen.getByRole("heading", { name: "Shift Swap" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(
      screen.queryByRole("heading", { name: "Shift Swap" }),
    ).not.toBeInTheDocument();
  });

  it("shows 'View' action label for a swap the current user cannot action", async () => {
    server.use(
      http.get(`${BASE}/api/v1/swaps`, () =>
        HttpResponse.json([{ ...mockSwapRequest, status: "Approved" }]),
      ),
    );
    renderWithProviders(<SwapsPage />, { user: mockUser });
    expect(
      await screen.findByRole("button", { name: "View" }),
    ).toBeInTheDocument();
  });
});
