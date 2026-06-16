import type { DragEndEvent } from "@dnd-kit/core";
import { act, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { mockShift } from "../../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import WeeklyGrid from "../WeeklyGrid";

// Capture onDragEnd from DndContext while still rendering the real context so
// useDroppable / useDraggable hooks inside child components continue to work.
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

const makeDragEvent = (activeId: number, overId: string | null) =>
  ({
    active: { id: activeId },
    over: overId !== null ? { id: overId } : null,
  }) as unknown as DragEndEvent;

// Week starting Monday June 15, 2026
const weekDays = Array.from({ length: 7 }, (_, i) => {
  const d = new Date("2026-06-15T00:00:00");
  d.setDate(d.getDate() + i);
  return d;
});

function renderGrid(props: Partial<Parameters<typeof WeeklyGrid>[0]> = {}) {
  return renderWithProviders(
    <WeeklyGrid
      weekDays={weekDays}
      shifts={[]}
      canEdit={false}
      approvedLeaves={[]}
      onDeleteShift={vi.fn()}
      onCreateShift={vi.fn()}
      onMoveShift={vi.fn()}
      {...props}
    />,
  );
}

describe("WeeklyGrid", () => {
  it("renders a column for each day of the week", () => {
    renderGrid();
    // Verify all 7 day abbreviations appear
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) =>
      expect(screen.getByText(day)).toBeInTheDocument(),
    );
  });

  it("renders shift cards in the correct day column", () => {
    // mockShift startTime is 2026-06-16 (Tue)
    renderGrid({ shifts: [mockShift], canEdit: false });
    expect(screen.getByText("Mark Stevens")).toBeInTheDocument();
  });

  it("shows 'Add shift' buttons for all 7 days when canEdit is true", () => {
    renderGrid({ canEdit: true });
    expect(screen.getAllByRole("button", { name: "Add shift" })).toHaveLength(
      7,
    );
  });

  it("does not show 'Add shift' buttons when canEdit is false", () => {
    renderGrid({ canEdit: false });
    expect(
      screen.queryByRole("button", { name: "Add shift" }),
    ).not.toBeInTheDocument();
  });

  it("calls onMoveShift when a shift is dragged to a different day", () => {
    const onMoveShift = vi.fn();
    // mockShift.startTime is 2026-06-16; dragging to 2026-06-17 should trigger move
    renderGrid({ shifts: [mockShift], canEdit: true, onMoveShift });

    act(() => {
      capturedOnDragEnd?.(makeDragEvent(mockShift.id, "2026-06-17"));
    });

    expect(onMoveShift).toHaveBeenCalledWith(mockShift.id, "2026-06-17");
  });

  it("does not call onMoveShift when a shift is dropped on the same day", () => {
    const onMoveShift = vi.fn();
    renderGrid({ shifts: [mockShift], canEdit: true, onMoveShift });

    act(() => {
      // mockShift is on 2026-06-16 → dropping on 2026-06-16 is a no-op
      capturedOnDragEnd?.(makeDragEvent(mockShift.id, "2026-06-16"));
    });

    expect(onMoveShift).not.toHaveBeenCalled();
  });

  it("does not call onMoveShift when there is no drop target (over is null)", () => {
    const onMoveShift = vi.fn();
    renderGrid({ shifts: [mockShift], canEdit: true, onMoveShift });

    act(() => {
      capturedOnDragEnd?.(makeDragEvent(mockShift.id, null));
    });

    expect(onMoveShift).not.toHaveBeenCalled();
  });
});
