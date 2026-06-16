import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import {
  mockAdminUser,
  mockStaffMember,
} from "../../../../test/mocks/fixtures";
import { server } from "../../../../test/mocks/server";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import type { ApprovedLeave } from "../../../../types/leave";
import CreateShiftModal from "../CreateShiftModal";

const BASE = "http://localhost";

function renderModal(
  props: Partial<Parameters<typeof CreateShiftModal>[0]> = {},
) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  return {
    onSubmit,
    onClose,
    ...renderWithProviders(
      <CreateShiftModal
        approvedLeaves={[]}
        onSubmit={onSubmit}
        onClose={onClose}
        isSubmitting={false}
        {...props}
      />,
      { user: mockAdminUser },
    ),
  };
}

describe("CreateShiftModal", () => {
  it("renders the 'New Shift' heading", () => {
    renderModal();
    expect(
      screen.getByRole("heading", { name: "New Shift" }),
    ).toBeInTheDocument();
  });

  it("renders Cancel and Create Shift buttons", () => {
    renderModal();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create Shift" }),
    ).toBeInTheDocument();
  });

  it("renders the Close (X) icon button", () => {
    renderModal();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("renders Morning, Afternoon, Night shift type options selected by default Morning", () => {
    renderModal();
    const morningRadio = screen.getByRole("radio", { name: /Morning/ });
    const afternoonRadio = screen.getByRole("radio", { name: /Afternoon/ });
    const nightRadio = screen.getByRole("radio", { name: /Night/ });
    expect(morningRadio).toBeChecked();
    expect(afternoonRadio).not.toBeChecked();
    expect(nightRadio).not.toBeChecked();
  });

  it("renders the notes textarea", () => {
    renderModal();
    expect(
      screen.getByPlaceholderText("Any special notes…"),
    ).toBeInTheDocument();
  });

  it("shows a validation error when submitted without selecting a staff member", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("button", { name: "Create Shift" }));
    expect(
      await screen.findByText("Select a staff member"),
    ).toBeInTheDocument();
  });

  it("shows a validation error when submitted without a date", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    const user = userEvent.setup();
    renderModal();
    // Wait for staff option to appear, then select it
    const staffOption = await screen.findByRole("option", {
      name: /Mark Stevens/,
    });
    await user.selectOptions(staffOption.closest("select")!, staffOption);
    await user.click(screen.getByRole("button", { name: "Create Shift" }));
    expect(await screen.findByText("Select a date")).toBeInTheDocument();
    expect(screen.queryByText("Select a staff member")).not.toBeInTheDocument();
  });

  it("shows a leave warning when the selected staff member is on leave on the chosen date", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    const approvedLeaves: ApprovedLeave[] = [
      {
        staffId: mockStaffMember.id,
        startDate: "2026-07-01",
        endDate: "2026-07-10",
      },
    ];
    const user = userEvent.setup();
    const { container } = renderModal({ approvedLeaves });
    const staffOption = await screen.findByRole("option", {
      name: /Mark Stevens/,
    });
    await user.selectOptions(staffOption.closest("select")!, staffOption);
    const dateInput =
      container.querySelector<HTMLInputElement>('input[name="date"]')!;
    await user.type(dateInput, "2026-07-05");
    expect(
      await screen.findByText(/has an approved leave on this date/),
    ).toBeInTheDocument();
  });

  it("disables the Create Shift button when staff is on leave on the chosen date", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    const approvedLeaves: ApprovedLeave[] = [
      {
        staffId: mockStaffMember.id,
        startDate: "2026-07-01",
        endDate: "2026-07-10",
      },
    ];
    const user = userEvent.setup();
    const { container } = renderModal({ approvedLeaves });
    const staffOption = await screen.findByRole("option", {
      name: /Mark Stevens/,
    });
    await user.selectOptions(staffOption.closest("select")!, staffOption);
    const dateInput =
      container.querySelector<HTMLInputElement>('input[name="date"]')!;
    await user.type(dateInput, "2026-07-05");
    await screen.findByText(/has an approved leave on this date/);
    expect(screen.getByRole("button", { name: "Create Shift" })).toBeDisabled();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the X icon button is clicked", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const { onClose, container } = renderModal();
    await user.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("changes the active shift type when the Afternoon option is clicked", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("radio", { name: /Afternoon/ }));
    expect(screen.getByRole("radio", { name: /Afternoon/ })).toBeChecked();
  });

  it("calls onSubmit with correct values on valid submission", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    const user = userEvent.setup();
    const { onSubmit, container } = renderModal();
    const staffOption = await screen.findByRole("option", {
      name: /Mark Stevens/,
    });
    await user.selectOptions(staffOption.closest("select")!, staffOption);
    const dateInput =
      container.querySelector<HTMLInputElement>('input[name="date"]')!;
    await user.type(dateInput, "2026-07-01");
    await user.click(screen.getByRole("button", { name: "Create Shift" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    // RHF calls onSubmit(data, event) — match data with objectContaining, event with anything()
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        staffId: String(mockStaffMember.id),
        date: "2026-07-01",
        shiftType: "Morning",
      }),
      expect.anything(),
    );
  });
});
