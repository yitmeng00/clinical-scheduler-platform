import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import {
  mockShift,
  mockStaffMember,
  mockStaffMember2,
  mockUser,
} from "../../../../test/mocks/fixtures";
import { server } from "../../../../test/mocks/server";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import RequestSwapModal from "../RequestSwapModal";

function renderModal(onClose = vi.fn()) {
  return renderWithProviders(<RequestSwapModal onClose={onClose} />, {
    user: mockUser,
  });
}

describe("RequestSwapModal", () => {
  it("renders the 'Request Shift Swap' heading", () => {
    renderModal();
    expect(
      screen.getByRole("heading", { name: "Request Shift Swap" }),
    ).toBeInTheDocument();
  });

  it("renders Cancel and Send Request buttons", () => {
    renderModal();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send Request" }),
    ).toBeInTheDocument();
  });

  it("renders the Close (X) icon button", () => {
    renderModal();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("renders 'Your Shift' and 'Swap With' selects", () => {
    renderModal();
    expect(screen.getByDisplayValue("Select your shift…")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("Select staff member…"),
    ).toBeInTheDocument();
  });

  it("'Their Shift' select is disabled until a staff member is selected", () => {
    renderModal();
    // Before selecting a staff member the Their Shift select is disabled
    const theirShiftSelect = screen.getByDisplayValue(
      "Select a staff member first…",
    );
    expect(theirShiftSelect).toBeDisabled();
  });

  it("shows validation error when submitted with empty fields", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("button", { name: "Send Request" }));
    expect(
      await screen.findByText("All fields are required."),
    ).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderModal(onClose);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the Close icon button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderModal(onClose);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = renderModal(onClose);
    await user.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders staff options from the staff list", async () => {
    server.use(
      http.get("http://localhost/api/v1/staff", () =>
        HttpResponse.json([mockStaffMember, mockStaffMember2]),
      ),
    );
    renderModal();
    // Emma White (id=9) should appear; Mark Stevens (id=8 = current user) is filtered out
    expect(
      await screen.findByRole("option", { name: /Emma White/ }),
    ).toBeInTheDocument();
  });

  it("renders my upcoming shift options from the API", async () => {
    server.use(
      http.get("http://localhost/api/v1/shifts/upcoming", () =>
        HttpResponse.json([mockShift]),
      ),
    );
    renderModal();
    // mockShift startTime is 2026-06-16, shiftType Morning → "Jun 16 · Morning"
    const myShiftSelect = screen.getByDisplayValue("Select your shift…");
    expect(
      await within(myShiftSelect).findByRole("option", { name: /Jun 16/ }),
    ).toBeInTheDocument();
  });

  it("shows 'No upcoming shifts' when target staff has no upcoming shifts", async () => {
    server.use(
      http.get("http://localhost/api/v1/staff", () =>
        HttpResponse.json([mockStaffMember, mockStaffMember2]),
      ),
      // shifts/upcoming returns [] (default) — target staff has no shifts
    );
    const user = userEvent.setup();
    renderModal();

    const swapWithSelect = screen.getByDisplayValue("Select staff member…");
    await within(swapWithSelect).findByRole("option", { name: /Emma White/ });
    await user.selectOptions(swapWithSelect, String(mockStaffMember2.id));

    expect(
      await screen.findByDisplayValue("No upcoming shifts"),
    ).toBeInTheDocument();
  });

  it("enables Their Shift select and populates options once target staff is selected", async () => {
    server.use(
      http.get("http://localhost/api/v1/staff", () =>
        HttpResponse.json([mockStaffMember, mockStaffMember2]),
      ),
      http.get("http://localhost/api/v1/shifts/upcoming", () =>
        HttpResponse.json([mockShift]),
      ),
    );
    const user = userEvent.setup();
    renderModal();

    // Before: Their Shift is disabled
    expect(
      screen.getByDisplayValue("Select a staff member first…"),
    ).toBeDisabled();

    // Select Emma White
    const swapWithSelect = screen.getByDisplayValue("Select staff member…");
    await within(swapWithSelect).findByRole("option", { name: /Emma White/ });
    await user.selectOptions(swapWithSelect, String(mockStaffMember2.id));

    // After: Their Shift enabled with options loaded
    const theirShiftSelect = await screen.findByDisplayValue(
      "Select their shift…",
    );
    expect(theirShiftSelect).not.toBeDisabled();
    expect(
      await within(theirShiftSelect).findByRole("option", { name: /Jun 16/ }),
    ).toBeInTheDocument();
  });

  it("calls onClose after a successful swap submission", async () => {
    server.use(
      http.get("http://localhost/api/v1/staff", () =>
        HttpResponse.json([mockStaffMember, mockStaffMember2]),
      ),
      http.get("http://localhost/api/v1/shifts/upcoming", () =>
        HttpResponse.json([mockShift]),
      ),
    );
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(onClose);

    // Select my shift
    const myShiftSelect = screen.getByDisplayValue("Select your shift…");
    await within(myShiftSelect).findByRole("option", { name: /Jun 16/ });
    await user.selectOptions(myShiftSelect, String(mockShift.id));

    // Select target staff
    const swapWithSelect = screen.getByDisplayValue("Select staff member…");
    await within(swapWithSelect).findByRole("option", { name: /Emma White/ });
    await user.selectOptions(swapWithSelect, String(mockStaffMember2.id));

    // Wait for their shifts to load then select
    const theirShiftSelect = await screen.findByDisplayValue(
      "Select their shift…",
    );
    await within(theirShiftSelect).findByRole("option", { name: /Jun 16/ });
    await user.selectOptions(theirShiftSelect, String(mockShift.id));

    // Type reason
    await user.type(
      screen.getByPlaceholderText(/explain the reason/),
      "Schedule conflict",
    );

    await user.click(screen.getByRole("button", { name: "Send Request" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("shows an error message when the swap API call fails", async () => {
    server.use(
      http.get("http://localhost/api/v1/staff", () =>
        HttpResponse.json([mockStaffMember, mockStaffMember2]),
      ),
      http.get("http://localhost/api/v1/shifts/upcoming", () =>
        HttpResponse.json([mockShift]),
      ),
      http.post(
        "http://localhost/api/v1/swaps",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderModal();

    const myShiftSelect = screen.getByDisplayValue("Select your shift…");
    await within(myShiftSelect).findByRole("option", { name: /Jun 16/ });
    await user.selectOptions(myShiftSelect, String(mockShift.id));

    const swapWithSelect = screen.getByDisplayValue("Select staff member…");
    await within(swapWithSelect).findByRole("option", { name: /Emma White/ });
    await user.selectOptions(swapWithSelect, String(mockStaffMember2.id));

    const theirShiftSelect = await screen.findByDisplayValue(
      "Select their shift…",
    );
    await within(theirShiftSelect).findByRole("option", { name: /Jun 16/ });
    await user.selectOptions(theirShiftSelect, String(mockShift.id));

    await user.type(
      screen.getByPlaceholderText(/explain the reason/),
      "Test reason",
    );

    await user.click(screen.getByRole("button", { name: "Send Request" }));
    expect(
      await screen.findByText(
        "Failed to submit swap request. Please try again.",
      ),
    ).toBeInTheDocument();
  });
});
