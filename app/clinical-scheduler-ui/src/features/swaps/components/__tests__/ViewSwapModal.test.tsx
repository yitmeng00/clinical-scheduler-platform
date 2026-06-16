import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  mockAdminUser,
  mockSwapRequest,
  mockUser,
} from "../../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import type { SwapRequest } from "../../../../types/swap";
import ViewSwapModal from "../ViewSwapModal";

function renderModal(
  swap: SwapRequest = mockSwapRequest,
  {
    myId = mockUser.id,
    canReview = false,
    onClose = vi.fn(),
  }: { myId?: number; canReview?: boolean; onClose?: () => void } = {},
) {
  return renderWithProviders(
    <ViewSwapModal
      swap={swap}
      myId={myId}
      canReview={canReview}
      onClose={onClose}
    />,
    { user: mockUser },
  );
}

describe("ViewSwapModal", () => {
  it("renders the 'Shift Swap' heading", () => {
    renderModal();
    expect(
      screen.getByRole("heading", { name: "Shift Swap" }),
    ).toBeInTheDocument();
  });

  it("shows the requester → requestee name line", () => {
    renderModal();
    expect(screen.getByText("Emma White → Mark Stevens")).toBeInTheDocument();
  });

  it("shows the status badge", () => {
    renderModal();
    expect(screen.getByText("Awaiting Response")).toBeInTheDocument();
  });

  it("shows the swap reason", () => {
    renderModal();
    expect(screen.getByText("Family appointment")).toBeInTheDocument();
  });

  it("shows both shift dates and types", () => {
    renderModal();
    // Requester shift: Jul 1 · Morning; Requestee shift: Jul 2 · Afternoon
    expect(screen.getByText(/Morning/)).toBeInTheDocument();
    expect(screen.getByText(/Afternoon/)).toBeInTheDocument();
  });

  it("shows Accept and Reject buttons when the current user is the requestee on a PendingRequestee swap", () => {
    // mockSwapRequest.requesteeId = 8 = mockUser.id, status = PendingRequestee
    renderModal(mockSwapRequest, { myId: mockUser.id });
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("shows Approve and Reject buttons for an admin reviewer on a PendingAdmin swap", () => {
    const pendingAdminSwap: SwapRequest = {
      ...mockSwapRequest,
      status: "PendingAdmin",
    };
    renderModal(pendingAdminSwap, {
      myId: mockAdminUser.id,
      canReview: true,
    });
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("shows 'Cancel Request' button for the requester on a pending swap", () => {
    const mySwap: SwapRequest = {
      ...mockSwapRequest,
      requesterId: mockUser.id,
      requesteeId: 9,
    };
    renderModal(mySwap, { myId: mockUser.id });
    expect(
      screen.getByRole("button", { name: "Cancel Request" }),
    ).toBeInTheDocument();
  });

  it("shows the audit trail when entries exist", () => {
    const swapWithAudit: SwapRequest = {
      ...mockSwapRequest,
      auditEntries: [
        {
          at: "2026-06-15T10:00:00Z",
          by: "Emma White",
          action: "submitted",
          note: null,
        },
      ],
    };
    renderModal(swapWithAudit);
    expect(screen.getByText("Audit Trail")).toBeInTheDocument();
    expect(screen.getByText(/submitted this request/)).toBeInTheDocument();
  });

  it("calls onClose when the Close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderModal(mockSwapRequest, { onClose });
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = renderModal(mockSwapRequest, { onClose });
    await user.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
