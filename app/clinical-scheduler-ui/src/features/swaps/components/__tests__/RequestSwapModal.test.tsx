import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { mockUser } from "../../../../test/mocks/fixtures";
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
});
