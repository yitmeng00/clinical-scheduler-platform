import { DndContext, useDraggable } from "@dnd-kit/core";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@dnd-kit/core", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@dnd-kit/core")>();
  return { ...mod, useDraggable: vi.fn() };
});

import { mockShift } from "../../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import ShiftCard from "../ShiftCard";

function renderCard(props: Partial<Parameters<typeof ShiftCard>[0]> = {}) {
  return renderWithProviders(
    <DndContext>
      <ShiftCard
        shift={mockShift}
        canEdit={false}
        onDelete={vi.fn()}
        {...props}
      />
    </DndContext>,
  );
}

const defaultDraggable = {
  attributes: {},
  listeners: undefined,
  setNodeRef: vi.fn(),
  transform: null,
  isDragging: false,
} as unknown as ReturnType<typeof useDraggable>;

beforeEach(() => {
  vi.mocked(useDraggable).mockReturnValue(defaultDraggable);
});

describe("ShiftCard", () => {
  it("renders the staff name and initials", () => {
    renderCard();
    expect(screen.getByText("Mark Stevens")).toBeInTheDocument();
    expect(screen.getByText("MS")).toBeInTheDocument();
  });

  it("renders the shift type badge", () => {
    renderCard();
    expect(screen.getByText("Morning")).toBeInTheDocument();
  });

  it("does not show 'On Leave' badge by default", () => {
    renderCard();
    expect(screen.queryByText("On Leave")).not.toBeInTheDocument();
  });

  it("shows 'On Leave' badge when isOnLeave is true", () => {
    renderCard({ isOnLeave: true });
    expect(screen.getByText("On Leave")).toBeInTheDocument();
  });

  it("does not render a delete button when canEdit is false", () => {
    renderCard({ canEdit: false });
    expect(
      screen.queryByRole("button", { name: "Delete shift" }),
    ).not.toBeInTheDocument();
  });

  it("renders a delete button when canEdit is true", () => {
    renderCard({ canEdit: true });
    expect(
      screen.getByRole("button", { name: "Delete shift" }),
    ).toBeInTheDocument();
  });

  it("calls onDelete with the shift id when delete button is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    renderCard({ canEdit: true, onDelete });
    await user.click(screen.getByRole("button", { name: "Delete shift" }));
    expect(onDelete).toHaveBeenCalledWith(mockShift.id);
  });

  it("applies a transform style and dragging opacity when the card is being dragged", () => {
    vi.mocked(useDraggable).mockReturnValueOnce({
      ...defaultDraggable,
      transform: { x: 10, y: 5, scaleX: 1, scaleY: 1 },
      isDragging: true,
    } as unknown as ReturnType<typeof useDraggable>);
    const { container } = renderCard({ canEdit: true });
    expect(container.querySelector('[style*="translate"]')).toBeInTheDocument();
    expect(container.querySelector(".opacity-50")).toBeInTheDocument();
  });
});
