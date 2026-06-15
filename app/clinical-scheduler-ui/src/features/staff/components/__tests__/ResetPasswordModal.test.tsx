import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { mockStaffMember, mockUser } from "../../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import ResetPasswordModal from "../ResetPasswordModal";

function renderModal(onClose = vi.fn()) {
  return renderWithProviders(
    <ResetPasswordModal staff={mockStaffMember} onClose={onClose} />,
    { user: mockUser },
  );
}

describe("ResetPasswordModal", () => {
  it("renders the Reset Password heading", () => {
    renderModal();
    expect(
      screen.getByRole("heading", { name: "Reset Password" }),
    ).toBeInTheDocument();
  });

  it("shows the staff member's full name", () => {
    renderModal();
    expect(screen.getByText("Mark Stevens")).toBeInTheDocument();
  });

  it("renders New Password and Confirm Password inputs", () => {
    renderModal();
    expect(
      screen.getByPlaceholderText("Min. 6 characters"),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Re-enter password"),
    ).toBeInTheDocument();
  });

  it("renders the Reset Password submit button", () => {
    renderModal();
    expect(
      screen.getByRole("button", { name: "Reset Password" }),
    ).toBeInTheDocument();
  });

  it("shows an error when New Password is empty on submit", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("button", { name: "Reset Password" }));
    expect(
      await screen.findByText("Password is required."),
    ).toBeInTheDocument();
  });

  it("shows an error when password is shorter than 6 characters", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(screen.getByPlaceholderText("Min. 6 characters"), "abc");
    await user.click(screen.getByRole("button", { name: "Reset Password" }));
    expect(
      await screen.findByText("Password must be at least 6 characters."),
    ).toBeInTheDocument();
  });

  it("shows an error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.type(
      screen.getByPlaceholderText("Min. 6 characters"),
      "password123",
    );
    await user.type(
      screen.getByPlaceholderText("Re-enter password"),
      "different456",
    );
    await user.click(screen.getByRole("button", { name: "Reset Password" }));
    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
  });

  it("calls onClose after a successful password reset", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ResetPasswordModal staff={mockStaffMember} onClose={onClose} />,
      { user: mockUser },
    );
    await user.type(
      screen.getByPlaceholderText("Min. 6 characters"),
      "newpassword",
    );
    await user.type(
      screen.getByPlaceholderText("Re-enter password"),
      "newpassword",
    );
    await user.click(screen.getByRole("button", { name: "Reset Password" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ResetPasswordModal staff={mockStaffMember} onClose={onClose} />,
      { user: mockUser },
    );
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the X icon button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ResetPasswordModal staff={mockStaffMember} onClose={onClose} />,
      { user: mockUser },
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <ResetPasswordModal staff={mockStaffMember} onClose={onClose} />,
      { user: mockUser },
    );
    await user.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
