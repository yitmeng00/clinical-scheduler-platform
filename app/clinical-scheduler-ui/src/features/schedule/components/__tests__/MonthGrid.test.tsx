import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mockShift } from "../../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import type { ApprovedLeave } from "../../../../types/leave";
import MonthGrid from "../MonthGrid";

// June 2026 — month=5 (0-based), year=2026
const YEAR = 2026;
const MONTH = 5;

describe("MonthGrid", () => {
  beforeEach(() => vi.setSystemTime(new Date("2026-06-16T10:00:00")));
  afterEach(() => vi.useRealTimers());

  it("renders Mon-Sun column headers", () => {
    renderWithProviders(
      <MonthGrid year={YEAR} month={MONTH} shifts={[]} approvedLeaves={[]} />,
    );
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((d) =>
      expect(screen.getByText(d)).toBeInTheDocument(),
    );
  });

  it("renders day numbers for all days in June", () => {
    renderWithProviders(
      <MonthGrid year={YEAR} month={MONTH} shifts={[]} approvedLeaves={[]} />,
    );
    // June has 30 days
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("highlights today's date with accent styling", () => {
    renderWithProviders(
      <MonthGrid year={YEAR} month={MONTH} shifts={[]} approvedLeaves={[]} />,
    );
    // Today is 2026-06-16; its span gets bg-accent text-white
    const todaySpan = screen
      .getAllByText("16")
      .find((el) => el.className.includes("bg-accent"));
    expect(todaySpan).toBeTruthy();
  });

  it("shows shift type count for a date with shifts", () => {
    const shifts = [{ ...mockShift }, { ...mockShift, id: 2 }];
    renderWithProviders(
      <MonthGrid
        year={YEAR}
        month={MONTH}
        shifts={shifts}
        approvedLeaves={[]}
      />,
    );
    // Two morning shifts on 2026-06-16 → "×2"
    expect(screen.getByText("×2")).toBeInTheDocument();
    expect(screen.getByText("Morning")).toBeInTheDocument();
  });

  it("shows 'On Leave' indicator for dates with approved leaves", () => {
    const approvedLeaves: ApprovedLeave[] = [
      { staffId: 8, startDate: "2026-06-16", endDate: "2026-06-16" },
    ];
    renderWithProviders(
      <MonthGrid
        year={YEAR}
        month={MONTH}
        shifts={[]}
        approvedLeaves={approvedLeaves}
      />,
    );
    expect(screen.getByText("On Leave")).toBeInTheDocument();
    expect(screen.getByText("×1")).toBeInTheDocument();
  });

  it("shows correct count when multiple staff are on leave on the same day", () => {
    const approvedLeaves: ApprovedLeave[] = [
      { staffId: 8, startDate: "2026-06-16", endDate: "2026-06-16" },
      { staffId: 9, startDate: "2026-06-16", endDate: "2026-06-16" },
    ];
    renderWithProviders(
      <MonthGrid
        year={YEAR}
        month={MONTH}
        shifts={[]}
        approvedLeaves={approvedLeaves}
      />,
    );
    expect(screen.getByText("×2")).toBeInTheDocument();
  });
});
