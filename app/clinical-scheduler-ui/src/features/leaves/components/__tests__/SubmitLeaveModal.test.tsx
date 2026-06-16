import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { mockUser } from "../../../../test/mocks/fixtures";
import { server } from "../../../../test/mocks/server";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import SubmitLeaveModal from "../SubmitLeaveModal";

const BASE = "http://localhost";

function renderModal(onClose = vi.fn()) {
  return renderWithProviders(<SubmitLeaveModal onClose={onClose} />, {
    user: mockUser,
  });
}

describe("SubmitLeaveModal", () => {
  it("renders the Request Leave heading", () => {
    renderModal();
    expect(
      screen.getByRole("heading", { name: "Request Leave" }),
    ).toBeInTheDocument();
  });

  it("renders the leave type select, date inputs, and reason textarea", () => {
    const { container } = renderModal();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(
      container.querySelector('input[name="startDate"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('input[name="endDate"]'),
    ).toBeInTheDocument();
    expect(container.querySelector("textarea")).toBeInTheDocument();
  });

  it("pre-selects Annual Leave as the default leave type", () => {
    renderModal();
    expect(screen.getByRole("combobox")).toHaveValue("Annual");
  });

  it("lists all leave type options in the select", () => {
    renderModal();
    const select = screen.getByRole("combobox");
    for (const label of [
      "Annual Leave",
      "Sick Leave",
      "Maternity / Paternity",
      "Compassionate Leave",
      "Emergency Leave",
      "Unpaid Leave",
    ]) {
      expect(
        within(select).getByRole("option", { name: label }),
      ).toBeInTheDocument();
    }
  });

  it("shows required-field errors when the empty form is submitted", async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByRole("button", { name: "Submit Request" }));
    expect(
      await screen.findByText("Start date is required"),
    ).toBeInTheDocument();
    expect(screen.getByText("End date is required")).toBeInTheDocument();
    expect(screen.getByText("Reason is required")).toBeInTheDocument();
  });

  it("shows an error when End Date is before Start Date", async () => {
    const user = userEvent.setup();
    const { container } = renderModal();
    const startInput = container.querySelector<HTMLInputElement>(
      'input[name="startDate"]',
    )!;
    const endInput = container.querySelector<HTMLInputElement>(
      'input[name="endDate"]',
    )!;
    await user.type(startInput, "2026-08-10");
    await user.type(endInput, "2026-08-05");
    await user.type(container.querySelector("textarea")!, "test reason");
    await user.click(screen.getByRole("button", { name: "Submit Request" }));
    expect(
      await screen.findByText("End date must be on or after start date"),
    ).toBeInTheDocument();
  });

  it("calls onClose after a successful submission", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <SubmitLeaveModal onClose={onClose} />,
      { user: mockUser },
    );
    const startInput = container.querySelector<HTMLInputElement>(
      'input[name="startDate"]',
    )!;
    const endInput = container.querySelector<HTMLInputElement>(
      'input[name="endDate"]',
    )!;
    await user.type(startInput, "2026-08-01");
    await user.type(endInput, "2026-08-05");
    await user.type(container.querySelector("textarea")!, "Family vacation");
    await user.click(screen.getByRole("button", { name: "Submit Request" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<SubmitLeaveModal onClose={onClose} />, {
      user: mockUser,
    });
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the X icon button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<SubmitLeaveModal onClose={onClose} />, {
      user: mockUser,
    });
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop overlay is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <SubmitLeaveModal onClose={onClose} />,
      { user: mockUser },
    );
    await user.click(container.firstChild as Element);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows 'Submitting…' while the leave request is in flight", async () => {
    server.use(
      http.post(`${BASE}/api/v1/leaves`, async () => {
        await new Promise((r) => setTimeout(r, 300));
        return HttpResponse.json({});
      }),
    );
    const user = userEvent.setup();
    const { container } = renderModal();
    await user.type(
      container.querySelector<HTMLInputElement>('input[name="startDate"]')!,
      "2026-08-01",
    );
    await user.type(
      container.querySelector<HTMLInputElement>('input[name="endDate"]')!,
      "2026-08-05",
    );
    await user.type(container.querySelector("textarea")!, "Family vacation");
    await user.click(screen.getByRole("button", { name: "Submit Request" }));
    expect(await screen.findByText("Submitting…")).toBeInTheDocument();
  });

  it("shows a validation error for leave type when the field is cleared", async () => {
    const user = userEvent.setup();
    const { container } = renderModal();
    // Force the select value to empty so Zod's min(1) rule fires
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
    await user.type(
      container.querySelector<HTMLInputElement>('input[name="startDate"]')!,
      "2026-08-01",
    );
    await user.type(
      container.querySelector<HTMLInputElement>('input[name="endDate"]')!,
      "2026-08-05",
    );
    await user.type(container.querySelector("textarea")!, "test reason");
    await user.click(screen.getByRole("button", { name: "Submit Request" }));
    expect(await screen.findByText("Select a leave type")).toBeInTheDocument();
  });
});
