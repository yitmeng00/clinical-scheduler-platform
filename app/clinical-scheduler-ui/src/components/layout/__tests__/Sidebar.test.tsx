import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { mockAdminUser, mockUser } from "../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import Sidebar from "../Sidebar";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

function renderSidebar(user = mockUser) {
  return renderWithProviders(
    <Sidebar mobileOpen={false} onMobileClose={vi.fn()} />,
    { user },
  );
}

describe("Sidebar", () => {
  it("renders the CareShift brand", () => {
    renderSidebar();
    expect(screen.getByText("CareShift")).toBeInTheDocument();
  });

  it("shows nav items visible to all roles", () => {
    renderSidebar();
    expect(
      screen.getByRole("link", { name: /Dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Schedule/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Leave Requests/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Shift Swaps/i }),
    ).toBeInTheDocument();
  });

  it("does NOT show Admin-only nav items for a Receptionist", () => {
    renderSidebar(mockUser); // Receptionist
    expect(
      screen.queryByRole("link", { name: /Audit Log/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /^Staff$/i }),
    ).not.toBeInTheDocument();
  });

  it("shows Admin-only nav items for an Admin user", () => {
    renderSidebar(mockAdminUser);
    expect(
      screen.getByRole("link", { name: /Audit Log/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Staff$/i })).toBeInTheDocument();
  });

  it("displays the user's full name and role label", () => {
    renderSidebar();
    expect(screen.getByText("Mark Stevens")).toBeInTheDocument();
    expect(screen.getByText("Receptionist")).toBeInTheDocument();
  });

  it("dispatches logout and navigates to /login when sign-out is clicked", async () => {
    const user = userEvent.setup();
    const { store } = renderSidebar();
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(store.getState().auth.isAuthenticated).toBe(false);
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true }),
    );
  });

  it("renders the mobile overlay when mobileOpen is true", () => {
    renderWithProviders(<Sidebar mobileOpen={true} onMobileClose={vi.fn()} />, {
      user: mockUser,
    });
    // The close button is only present in the mobile overlay
    expect(
      screen.getByRole("button", { name: "Close menu" }),
    ).toBeInTheDocument();
  });

  it("calls onMobileClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const onMobileClose = vi.fn();
    renderWithProviders(
      <Sidebar mobileOpen={true} onMobileClose={onMobileClose} />,
      { user: mockUser },
    );
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(onMobileClose).toHaveBeenCalledOnce();
  });
});
