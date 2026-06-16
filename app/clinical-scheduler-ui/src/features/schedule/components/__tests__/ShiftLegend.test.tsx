import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "../../../../test/utils/renderWithProviders";
import ShiftLegend from "../ShiftLegend";

describe("ShiftLegend", () => {
  it("renders all three shift type labels", () => {
    renderWithProviders(<ShiftLegend />);
    expect(screen.getByText("Morning")).toBeInTheDocument();
    expect(screen.getByText("Afternoon")).toBeInTheDocument();
    expect(screen.getByText("Night")).toBeInTheDocument();
  });

  it("shows the correct time range for each shift type", () => {
    renderWithProviders(<ShiftLegend />);
    expect(screen.getByText("07:00 - 15:00")).toBeInTheDocument();
    expect(screen.getByText("15:00 - 23:00")).toBeInTheDocument();
    expect(screen.getByText("23:00 - 07:00")).toBeInTheDocument();
  });
});
