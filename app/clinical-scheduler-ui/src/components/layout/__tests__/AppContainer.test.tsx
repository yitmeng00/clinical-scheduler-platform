import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockUser } from "../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import AppContainer from "../AppContainer";

// useSignalR tries to open a real WebSocket connection — stub it out.
vi.mock("../../../signalr/useSignalR", () => ({ useSignalR: vi.fn() }));

describe("AppContainer", () => {
  it("redirects to /login when the user is not authenticated", () => {
    renderWithProviders(<AppContainer />, { route: "/dashboard" });
    // No auth state → Navigate to /login is rendered instead of layout
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("renders the main layout when authenticated", () => {
    renderWithProviders(<AppContainer />, { user: mockUser });
    // Sidebar brand text and TopBar are both rendered
    expect(screen.getByText("CareShift")).toBeInTheDocument();
  });

  it("renders nav links for all roles when authenticated", () => {
    renderWithProviders(<AppContainer />, { user: mockUser });
    expect(
      screen.getByRole("link", { name: /Dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Schedule/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Leave Requests/i }),
    ).toBeInTheDocument();
  });

  it("shows the user's full name in the sidebar", () => {
    renderWithProviders(<AppContainer />, { user: mockUser });
    expect(screen.getByText("Mark Stevens")).toBeInTheDocument();
  });
});
