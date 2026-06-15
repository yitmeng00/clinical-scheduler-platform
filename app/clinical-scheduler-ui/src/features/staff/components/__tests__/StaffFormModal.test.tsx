import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { mockUser, mockStaffMember } from "../../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import StaffFormModal from "../StaffFormModal";

describe("StaffFormModal — add mode", () => {
  it("renders the Add Staff Member heading", () => {
    renderWithProviders(<StaffFormModal onClose={vi.fn()} />, {
      user: mockUser,
    });
    expect(
      screen.getByRole("heading", { name: "Add Staff Member" }),
    ).toBeInTheDocument();
  });

  it("renders the password field in add mode", () => {
    renderWithProviders(<StaffFormModal onClose={vi.fn()} />, {
      user: mockUser,
    });
    expect(
      screen.getByPlaceholderText("Temporary password"),
    ).toBeInTheDocument();
  });

  it("shows Add Staff as the submit button label", () => {
    renderWithProviders(<StaffFormModal onClose={vi.fn()} />, {
      user: mockUser,
    });
    expect(
      screen.getByRole("button", { name: "Add Staff" }),
    ).toBeInTheDocument();
  });

  it("shows a validation error when required fields are empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StaffFormModal onClose={vi.fn()} />, {
      user: mockUser,
    });
    await user.click(screen.getByRole("button", { name: "Add Staff" }));
    expect(
      await screen.findByText(/full name, email, and password are required/i),
    ).toBeInTheDocument();
  });

  it("calls onClose after a successful create", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<StaffFormModal onClose={onClose} />, {
      user: mockUser,
    });

    await user.type(
      screen.getByPlaceholderText("e.g. Dr. Jane Smith"),
      "Jane Smith",
    );
    await user.type(
      screen.getByPlaceholderText("jane.smith@hospital.org"),
      "jane@hospital.org",
    );
    await user.type(
      screen.getByPlaceholderText("Temporary password"),
      "password123",
    );
    await user.click(screen.getByRole("button", { name: "Add Staff" }));

    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("calls onClose when the Cancel button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<StaffFormModal onClose={onClose} />, {
      user: mockUser,
    });
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the X icon button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<StaffFormModal onClose={onClose} />, {
      user: mockUser,
    });
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("StaffFormModal — edit mode", () => {
  it("renders the Edit Staff Member heading", () => {
    renderWithProviders(
      <StaffFormModal staff={mockStaffMember} onClose={vi.fn()} />,
      { user: mockUser },
    );
    expect(
      screen.getByRole("heading", { name: "Edit Staff Member" }),
    ).toBeInTheDocument();
  });

  it("does not render the password field in edit mode", () => {
    renderWithProviders(
      <StaffFormModal staff={mockStaffMember} onClose={vi.fn()} />,
      { user: mockUser },
    );
    expect(
      screen.queryByPlaceholderText("Temporary password"),
    ).not.toBeInTheDocument();
  });

  it("pre-fills the full name and email with existing staff data", () => {
    renderWithProviders(
      <StaffFormModal staff={mockStaffMember} onClose={vi.fn()} />,
      { user: mockUser },
    );
    expect(screen.getByDisplayValue("Mark Stevens")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("m.stevens@hospital.org"),
    ).toBeInTheDocument();
  });

  it("pre-fills the phone number", () => {
    renderWithProviders(
      <StaffFormModal staff={mockStaffMember} onClose={vi.fn()} />,
      { user: mockUser },
    );
    expect(screen.getByDisplayValue("555-0108")).toBeInTheDocument();
  });

  it("shows Save Changes as the submit button label", () => {
    renderWithProviders(
      <StaffFormModal staff={mockStaffMember} onClose={vi.fn()} />,
      { user: mockUser },
    );
    expect(
      screen.getByRole("button", { name: "Save Changes" }),
    ).toBeInTheDocument();
  });

  it("calls onClose after a successful update", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <StaffFormModal staff={mockStaffMember} onClose={onClose} />,
      { user: mockUser },
    );
    await user.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });
});
