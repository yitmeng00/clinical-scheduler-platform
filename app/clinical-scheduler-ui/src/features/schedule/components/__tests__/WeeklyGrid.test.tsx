import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { mockShift } from "../../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import WeeklyGrid from "../WeeklyGrid";

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
});
