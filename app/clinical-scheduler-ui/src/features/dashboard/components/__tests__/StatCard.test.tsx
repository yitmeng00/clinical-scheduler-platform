import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import StatCard from "../StatCard";
import type { StatCardVariant } from "../StatCard";

const variants: StatCardVariant[] = ["blue", "amber", "red", "green"];

function renderCard(
  props: Partial<React.ComponentProps<typeof StatCard>> = {},
) {
  return render(
    <MemoryRouter>
      <StatCard
        label="On Duty Today"
        value={12}
        sub="shifts scheduled"
        variant="blue"
        {...props}
      />
    </MemoryRouter>,
  );
}

describe("StatCard", () => {
  it("renders the label, value, and sub text", () => {
    renderCard();
    expect(screen.getByText("On Duty Today")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("shifts scheduled")).toBeInTheDocument();
  });

  it("renders a dash instead of the value when isLoading is true", () => {
    renderCard({ isLoading: true });
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByText("12")).not.toBeInTheDocument();
  });

  it("renders a <Link> wrapping the card when `to` is provided", () => {
    renderCard({ to: "/schedule" });
    expect(screen.getByRole("link")).toHaveAttribute("href", "/schedule");
  });

  it("does not render a link when `to` is omitted", () => {
    renderCard();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("string values render as-is", () => {
    renderCard({ value: "N/A" });
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders without errors for all variants", () => {
    for (const variant of variants) {
      const { unmount } = renderCard({ variant });
      expect(screen.getByText("On Duty Today")).toBeInTheDocument();
      unmount();
    }
  });

  it("shows a dash and keeps the link when isLoading with `to`", () => {
    renderCard({ isLoading: true, to: "/schedule" });
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/schedule");
  });
});
