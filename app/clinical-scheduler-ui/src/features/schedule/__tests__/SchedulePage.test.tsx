import type { DragEndEvent } from "@dnd-kit/core";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import {
  mockAdminUser,
  mockDeptLeadUser,
  mockShift,
  mockUser,
} from "../../../test/mocks/fixtures";
import { server } from "../../../test/mocks/server";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import SchedulePage from "../SchedulePage";

// Wrap DndContext to capture onDragEnd so we can simulate drags in SchedulePage tests.
let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
vi.mock("@dnd-kit/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@dnd-kit/core")>();
  const { DndContext: RealDndContext } = mod;
  return {
    ...mod,
    DndContext: (props: Parameters<typeof RealDndContext>[0]) => {
      capturedOnDragEnd = props.onDragEnd;
      return React.createElement(RealDndContext, props);
    },
  };
});

const BASE = "http://localhost";

describe("SchedulePage", () => {
  it("renders the Schedule heading", () => {
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    expect(
      screen.getByRole("heading", { name: "Schedule" }),
    ).toBeInTheDocument();
  });

  it("renders the Week and Month view toggle buttons", () => {
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    expect(screen.getByRole("button", { name: "Week" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Month" })).toBeInTheDocument();
  });

  it("renders Previous, Today, and Next navigation buttons", () => {
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    expect(
      screen.getByRole("button", { name: "Previous" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("renders the department filter select with default 'All departments'", () => {
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    expect(screen.getByDisplayValue("All departments")).toBeInTheDocument();
  });

  it("shows the ShiftLegend (Morning / Afternoon / Night)", () => {
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    expect(screen.getByText("Morning")).toBeInTheDocument();
    expect(screen.getByText("Afternoon")).toBeInTheDocument();
    expect(screen.getByText("Night")).toBeInTheDocument();
  });

  it("shows 'New Shift' button for Admin", () => {
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    expect(
      screen.getByRole("button", { name: /New Shift/ }),
    ).toBeInTheDocument();
  });

  it("shows 'New Shift' button for DepartmentLead", () => {
    renderWithProviders(<SchedulePage />, { user: mockDeptLeadUser });
    expect(
      screen.getByRole("button", { name: /New Shift/ }),
    ).toBeInTheDocument();
  });

  it("does NOT show 'New Shift' button for non-editor role", () => {
    renderWithProviders(<SchedulePage />, { user: mockUser });
    expect(
      screen.queryByRole("button", { name: /New Shift/ }),
    ).not.toBeInTheDocument();
  });

  it("switches to Month view when the Month button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    await user.click(screen.getByRole("button", { name: "Month" }));
    // MonthGrid only renders after the month data loads — use findByText
    expect(await screen.findByText("Mon")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();
  });

  it("opens CreateShiftModal when 'New Shift' is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    await user.click(screen.getByRole("button", { name: /New Shift/ }));
    expect(
      screen.getByRole("heading", { name: "New Shift" }),
    ).toBeInTheDocument();
  });

  it("shows the weekly grid with day columns after data loads", async () => {
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    // Week grid renders 7 'Add shift' buttons for canEdit users
    expect(
      await screen.findAllByRole("button", { name: "Add shift" }),
    ).toHaveLength(7);
  });

  it("renders a shift card when shifts are returned from the API", async () => {
    server.use(
      http.get(`${BASE}/api/v1/shifts`, () => HttpResponse.json([mockShift])),
    );
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    expect(await screen.findByText("Mark Stevens")).toBeInTheDocument();
  });

  it("navigates to the next week when Next is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    const nextBtn = screen.getByRole("button", { name: "Next" });
    // The week label is in the <p> that immediately follows the <h1>
    const heading = screen.getByRole("heading", { name: "Schedule" });
    const initialLabel = heading.nextElementSibling?.textContent;
    await user.click(nextBtn);
    const newLabel = heading.nextElementSibling?.textContent;
    expect(newLabel).not.toBe(initialLabel);
  });

  it("navigates to the previous month when Previous is clicked in month view", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });

    await user.click(screen.getByRole("button", { name: "Month" }));
    await screen.findByText("Mon");

    const heading = screen.getByRole("heading", { name: "Schedule" });
    const initialLabel = heading.nextElementSibling?.textContent;

    await user.click(screen.getByRole("button", { name: "Previous" }));

    expect(heading.nextElementSibling?.textContent).not.toBe(initialLabel);
  });

  it("navigates to the next month when Next is clicked in month view", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });

    await user.click(screen.getByRole("button", { name: "Month" }));
    await screen.findByText("Mon");

    const heading = screen.getByRole("heading", { name: "Schedule" });
    const initialLabel = heading.nextElementSibling?.textContent;

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(heading.nextElementSibling?.textContent).not.toBe(initialLabel);
  });

  it("returns to the current month when Today is clicked after navigating away", async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });

    await user.click(screen.getByRole("button", { name: "Month" }));
    await screen.findByText("Mon");

    const heading = screen.getByRole("heading", { name: "Schedule" });
    const currentMonthLabel = heading.nextElementSibling?.textContent;

    // Navigate away
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(heading.nextElementSibling?.textContent).not.toBe(currentMonthLabel);

    // Click Today — goes back to current month
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(heading.nextElementSibling?.textContent).toBe(currentMonthLabel);
  });

  it("calls PATCH /shifts/:id when a shift is dragged to a different day", async () => {
    let patchCalled = false;
    server.use(
      http.get(`${BASE}/api/v1/shifts`, () => HttpResponse.json([mockShift])),
      http.patch(`${BASE}/api/v1/shifts/:id`, () => {
        patchCalled = true;
        return HttpResponse.json({ id: 1 });
      }),
    );
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });
    await screen.findByText("Mark Stevens"); // shifts loaded

    // Simulate drag: mockShift is on 2026-06-16, dropped on 2026-06-17
    act(() => {
      capturedOnDragEnd?.({
        active: { id: mockShift.id },
        over: { id: "2026-06-17" },
      } as unknown as DragEndEvent);
    });

    await waitFor(() => expect(patchCalled).toBe(true));
  });

  it("deletes a shift when the Delete shift button is clicked", async () => {
    // Stateful handler: after DELETE the list becomes empty so refetch returns []
    let shiftsData = [mockShift];
    server.use(
      http.get(`${BASE}/api/v1/shifts`, () => HttpResponse.json(shiftsData)),
      http.delete(`${BASE}/api/v1/shifts/:id`, () => {
        shiftsData = [];
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<SchedulePage />, { user: mockAdminUser });

    expect(await screen.findByText("Mark Stevens")).toBeInTheDocument();

    // Delete shift button has aria-label="Delete shift" (accessible in jsdom despite CSS hidden)
    await user.click(screen.getByRole("button", { name: "Delete shift" }));

    await waitFor(() =>
      expect(screen.queryByText("Mark Stevens")).not.toBeInTheDocument(),
    );
  });
});
