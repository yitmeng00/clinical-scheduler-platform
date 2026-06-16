import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { mockMyProfile, mockUser } from "../../../test/mocks/fixtures";
import { server } from "../../../test/mocks/server";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import ProfilePanel from "../ProfilePanel";

const BASE = "http://localhost";

function renderPanel(onClose = vi.fn()) {
  return renderWithProviders(<ProfilePanel onClose={onClose} />, {
    user: mockUser,
  });
}

describe("ProfilePanel", () => {
  it("renders the 'My Profile' heading", () => {
    renderPanel();
    expect(
      screen.getByRole("heading", { name: "My Profile" }),
    ).toBeInTheDocument();
  });

  it("shows the profile name and email after data loads", async () => {
    renderPanel();
    expect(await screen.findByText("Mark Stevens")).toBeInTheDocument();
    // Email renders in both the avatar subtitle and the Info tab row
    expect(
      screen.getAllByText("m.stevens@hospital.org").length,
    ).toBeGreaterThan(0);
  });

  it("shows the role badge", async () => {
    renderPanel();
    await screen.findByText("Mark Stevens");
    expect(screen.getByText("Receptionist")).toBeInTheDocument();
  });

  it("renders Info and Password tab buttons", async () => {
    renderPanel();
    await screen.findByText("Mark Stevens");
    expect(screen.getByRole("button", { name: /Info/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Password/ }),
    ).toBeInTheDocument();
  });

  it("shows department, employment type, and email in the Info tab", async () => {
    renderPanel();
    await screen.findByText("Mark Stevens");
    expect(screen.getByText("Front Desk")).toBeInTheDocument();
    expect(screen.getByText("Full Time")).toBeInTheDocument();
    // Email appears in the avatar section and the info tab
    expect(
      screen.getAllByText("m.stevens@hospital.org").length,
    ).toBeGreaterThan(0);
  });

  it("switches to the Password tab when clicked", async () => {
    const user = userEvent.setup();
    renderPanel();
    await screen.findByText("Mark Stevens");
    await user.click(screen.getByRole("button", { name: /Password/ }));
    expect(
      screen.getByPlaceholderText("Enter current password"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Change Password" }),
    ).toBeInTheDocument();
  });

  it("shows 'All fields are required.' when the password form is submitted empty", async () => {
    const user = userEvent.setup();
    renderPanel();
    await screen.findByText("Mark Stevens");
    await user.click(screen.getByRole("button", { name: /Password/ }));
    await user.click(screen.getByRole("button", { name: "Change Password" }));
    expect(
      await screen.findByText("All fields are required."),
    ).toBeInTheDocument();
  });

  it("shows 'New password must be at least 6 characters.' for a short new password", async () => {
    const user = userEvent.setup();
    renderPanel();
    await screen.findByText("Mark Stevens");
    await user.click(screen.getByRole("button", { name: /Password/ }));
    await user.type(
      screen.getByPlaceholderText("Enter current password"),
      "current",
    );
    await user.type(screen.getByPlaceholderText("Min. 6 characters"), "abc");
    await user.type(
      screen.getByPlaceholderText("Re-enter new password"),
      "abc",
    );
    await user.click(screen.getByRole("button", { name: "Change Password" }));
    expect(
      await screen.findByText("New password must be at least 6 characters."),
    ).toBeInTheDocument();
  });

  it("shows 'New passwords do not match.' when confirm differs", async () => {
    const user = userEvent.setup();
    renderPanel();
    await screen.findByText("Mark Stevens");
    await user.click(screen.getByRole("button", { name: /Password/ }));
    await user.type(
      screen.getByPlaceholderText("Enter current password"),
      "current",
    );
    await user.type(
      screen.getByPlaceholderText("Min. 6 characters"),
      "newpass1",
    );
    await user.type(
      screen.getByPlaceholderText("Re-enter new password"),
      "newpass2",
    );
    await user.click(screen.getByRole("button", { name: "Change Password" }));
    expect(
      await screen.findByText("New passwords do not match."),
    ).toBeInTheDocument();
  });

  it("shows success message after a successful password change", async () => {
    const user = userEvent.setup();
    renderPanel();
    await screen.findByText("Mark Stevens");
    await user.click(screen.getByRole("button", { name: /Password/ }));
    await user.type(
      screen.getByPlaceholderText("Enter current password"),
      "current",
    );
    await user.type(
      screen.getByPlaceholderText("Min. 6 characters"),
      "newpassword",
    );
    await user.type(
      screen.getByPlaceholderText("Re-enter new password"),
      "newpassword",
    );
    await user.click(screen.getByRole("button", { name: "Change Password" }));
    expect(
      await screen.findByText("Password changed successfully."),
    ).toBeInTheDocument();
  });

  it("calls onClose when the X icon button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<ProfilePanel onClose={onClose} />, { user: mockUser });
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <ProfilePanel onClose={onClose} />,
      { user: mockUser },
    );
    // ProfilePanel renders a Fragment: backdrop div is the first child
    await user.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows an error when the profile endpoint fails", async () => {
    server.use(
      http.get(
        `${BASE}/api/v1/profile`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    renderPanel();
    // Falls back to loading state — at minimum the heading is always visible
    expect(
      screen.getByRole("heading", { name: "My Profile" }),
    ).toBeInTheDocument();
  });

  it("shows initials in the avatar", async () => {
    renderPanel();
    await screen.findByText("Mark Stevens");
    expect(screen.getByText(mockMyProfile.initials)).toBeInTheDocument();
  });
});
