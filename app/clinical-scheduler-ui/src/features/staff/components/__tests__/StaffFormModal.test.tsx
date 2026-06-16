import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { mockUser, mockStaffMember } from "../../../../test/mocks/fixtures";
import { server } from "../../../../test/mocks/server";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import StaffFormModal from "../StaffFormModal";

const BASE = "http://localhost";

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

describe("StaffFormModal — field interactions", () => {
  it("updates the role when a different option is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StaffFormModal onClose={vi.fn()} />, {
      user: mockUser,
    });
    await user.selectOptions(
      screen.getByDisplayValue("Nurse"),
      screen.getByRole("option", { name: "Doctor" }),
    );
    expect(screen.getByDisplayValue("Doctor")).toBeInTheDocument();
  });

  it("updates the department when a different option is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StaffFormModal onClose={vi.fn()} />, {
      user: mockUser,
    });
    const cardOption = await screen.findByRole("option", {
      name: "Cardiology",
    });
    await user.selectOptions(cardOption.closest("select")!, cardOption);
    expect(cardOption.closest("select")).toHaveValue("2");
  });

  it("updates the phone field when typed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StaffFormModal onClose={vi.fn()} />, {
      user: mockUser,
    });
    await user.type(screen.getByPlaceholderText("555-0100"), "555-9999");
    expect(screen.getByDisplayValue("555-9999")).toBeInTheDocument();
  });

  it("updates the employment type when a different option is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StaffFormModal onClose={vi.fn()} />, {
      user: mockUser,
    });
    const partTimeOption = screen.getByRole("option", { name: "Part Time" });
    await user.selectOptions(partTimeOption.closest("select")!, partTimeOption);
    expect((partTimeOption as HTMLOptionElement).selected).toBe(true);
  });

  it("shows an error message when the create API fails", async () => {
    server.use(
      http.post(
        `${BASE}/api/v1/staff`,
        () => new HttpResponse(null, { status: 409 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<StaffFormModal onClose={vi.fn()} />, {
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
    expect(
      await screen.findByText(
        "Failed to save. The email may already be in use.",
      ),
    ).toBeInTheDocument();
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
