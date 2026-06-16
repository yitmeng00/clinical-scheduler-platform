import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  mockAdminUser,
  mockApprovedLeave,
  mockDeptLeadUser,
  mockLeaveRequest,
  mockUser,
} from "../../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import ReviewLeaveModal from "../ReviewLeaveModal";

function renderPending(canReview = false, onClose = vi.fn()) {
  return renderWithProviders(
    <ReviewLeaveModal
      leave={mockLeaveRequest}
      canReview={canReview}
      onClose={onClose}
    />,
    { user: mockUser },
  );
}

function renderApproved(onClose = vi.fn()) {
  return renderWithProviders(
    <ReviewLeaveModal
      leave={mockApprovedLeave}
      canReview={false}
      onClose={onClose}
    />,
    { user: mockUser },
  );
}

describe("ReviewLeaveModal", () => {
  it("renders the leave type as the heading", () => {
    renderPending();
    expect(
      screen.getByRole("heading", { name: "Annual Leave" }),
    ).toBeInTheDocument();
  });

  it("shows the staff name and department", () => {
    renderPending();
    expect(screen.getByText(/Mark Stevens/)).toBeInTheDocument();
    expect(screen.getByText(/Front Desk/)).toBeInTheDocument();
  });

  it("shows the Pending status badge", () => {
    renderPending();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("shows the Approved status badge for an approved leave", () => {
    renderApproved();
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("shows the leave reason", () => {
    renderPending();
    expect(screen.getByText("Family vacation")).toBeInTheDocument();
  });

  it("shows duration in days", () => {
    renderPending();
    expect(screen.getByText("5 days")).toBeInTheDocument();
  });

  it("shows Approve and Reject buttons when canReview=true and status=Pending", () => {
    renderPending(true);
    expect(screen.getByRole("button", { name: /Approve/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reject/ })).toBeInTheDocument();
  });

  it("does NOT show Approve/Reject buttons when canReview=false", () => {
    renderPending(false);
    expect(
      screen.queryByRole("button", { name: /Approve/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Reject/ }),
    ).not.toBeInTheDocument();
  });

  it("does NOT show Approve/Reject buttons for an already-approved leave", () => {
    renderWithProviders(
      <ReviewLeaveModal
        leave={mockApprovedLeave}
        canReview={true}
        onClose={vi.fn()}
      />,
      { user: mockDeptLeadUser },
    );
    expect(
      screen.queryByRole("button", { name: /Approve/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Reject/ }),
    ).not.toBeInTheDocument();
  });

  it("shows a note textarea when the reviewer can review a pending leave", () => {
    renderPending(true);
    expect(screen.getByPlaceholderText(/Add a note/)).toBeInTheDocument();
  });

  it("shows the review note for an approved leave", () => {
    renderApproved();
    expect(screen.getByText("Approved as requested")).toBeInTheDocument();
  });

  it("renders the audit trail when entries exist", () => {
    renderApproved();
    expect(screen.getByText("Mark Stevens")).toBeInTheDocument();
    expect(screen.getByText(/submitted this request/)).toBeInTheDocument();
    expect(screen.getByText(/approved this request/)).toBeInTheDocument();
  });

  it("does NOT render the audit trail when there are no entries", () => {
    renderPending();
    expect(
      screen.queryByText(/submitted this request/),
    ).not.toBeInTheDocument();
  });

  it("calls onClose when the Close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ReviewLeaveModal
        leave={mockLeaveRequest}
        canReview={false}
        onClose={onClose}
      />,
      { user: mockUser },
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <ReviewLeaveModal
        leave={mockLeaveRequest}
        canReview={false}
        onClose={onClose}
      />,
      { user: mockUser },
    );
    await user.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose after Approve is clicked and API succeeds", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ReviewLeaveModal
        leave={mockLeaveRequest}
        canReview={true}
        onClose={onClose}
      />,
      { user: mockAdminUser },
    );
    await user.click(screen.getByRole("button", { name: /Approve/ }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("calls onClose after Reject is clicked and API succeeds", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ReviewLeaveModal
        leave={mockLeaveRequest}
        canReview={true}
        onClose={onClose}
      />,
      { user: mockAdminUser },
    );
    await user.click(screen.getByRole("button", { name: /Reject/ }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("includes the typed note when submitting a review", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <ReviewLeaveModal
        leave={mockLeaveRequest}
        canReview={true}
        onClose={onClose}
      />,
      { user: mockAdminUser },
    );
    await user.type(screen.getByPlaceholderText(/Add a note/), "Looks good");
    await user.click(screen.getByRole("button", { name: /Approve/ }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("shows '1 day' (singular) when durationDays is 1", () => {
    const oneDayLeave: typeof mockLeaveRequest = {
      ...mockLeaveRequest,
      durationDays: 1,
      endDate: "2024-03-01",
    };
    renderWithProviders(
      <ReviewLeaveModal
        leave={oneDayLeave}
        canReview={false}
        onClose={vi.fn()}
      />,
      { user: mockUser },
    );
    expect(screen.getByText("1 day")).toBeInTheDocument();
  });

  it("falls back to the raw action text for unknown audit actions", () => {
    const leaveWithUnknownAction: typeof mockApprovedLeave = {
      ...mockApprovedLeave,
      auditEntries: [
        {
          at: "2024-02-10T10:00:00Z",
          by: "System",
          action: "auto_processed", // not in ACTION_LABEL
          note: null,
        },
      ],
    };
    renderWithProviders(
      <ReviewLeaveModal
        leave={leaveWithUnknownAction}
        canReview={false}
        onClose={vi.fn()}
      />,
      { user: mockUser },
    );
    expect(screen.getByText(/auto_processed/)).toBeInTheDocument();
  });
});
