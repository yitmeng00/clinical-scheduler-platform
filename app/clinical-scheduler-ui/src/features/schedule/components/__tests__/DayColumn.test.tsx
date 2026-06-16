import { DndContext, useDroppable } from "@dnd-kit/core";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@dnd-kit/core")>();
  return { ...mod, useDroppable: vi.fn() };
});

import { mockShift } from "../../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import DayColumn from "../DayColumn";

// June 16, 2026 is a Tuesday
const mockDate = new Date("2026-06-16T00:00:00");

function renderColumn(props: Partial<Parameters<typeof DayColumn>[0]> = {}) {
  return renderWithProviders(
    <DndContext>
      <DayColumn
        date={mockDate}
        shifts={[]}
        isToday={false}
        canEdit={false}
        onLeaveStaffIds={new Set()}
        onDelete={vi.fn()}
        onCreateHere={vi.fn()}
        {...props}
      />
    </DndContext>,
  );
}

beforeEach(() => {
  vi.mocked(useDroppable).mockReturnValue({
    setNodeRef: vi.fn(),
    isOver: false,
  } as unknown as ReturnType<typeof useDroppable>);
});

describe("DayColumn", () => {
  it("renders the day abbreviation and date number", () => {
    renderColumn();
    expect(screen.getByText("Tue")).toBeInTheDocument();
    expect(screen.getByText("16")).toBeInTheDocument();
  });

  it("renders shift cards for provided shifts", () => {
    renderColumn({ shifts: [mockShift] });
    expect(screen.getByText("Mark Stevens")).toBeInTheDocument();
  });

  it("does not show 'Add shift' button when canEdit is false", () => {
    renderColumn({ canEdit: false });
    expect(
      screen.queryByRole("button", { name: "Add shift" }),
    ).not.toBeInTheDocument();
  });

  it("shows 'Add shift' button when canEdit is true", () => {
    renderColumn({ canEdit: true });
    expect(
      screen.getByRole("button", { name: "Add shift" }),
    ).toBeInTheDocument();
  });

  it("calls onCreateHere with the ISO date when 'Add shift' is clicked", async () => {
    const onCreateHere = vi.fn();
    const user = userEvent.setup();
    renderColumn({ canEdit: true, onCreateHere });
    await user.click(screen.getByRole("button", { name: "Add shift" }));
    expect(onCreateHere).toHaveBeenCalledWith("2026-06-16");
  });

  it("calls onDelete when a shift's delete button is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderColumn({ shifts: [mockShift], canEdit: true, onDelete });
    await user.click(screen.getByRole("button", { name: "Delete shift" }));
    expect(onDelete).toHaveBeenCalledWith(mockShift.id);
  });

  it("applies drag-over styles when a card is dragged over the column", () => {
    vi.mocked(useDroppable).mockReturnValueOnce({
      setNodeRef: vi.fn(),
      isOver: true,
    } as unknown as ReturnType<typeof useDroppable>);
    const { container } = renderColumn();
    expect(container.innerHTML).toContain("border-accent");
  });
});
