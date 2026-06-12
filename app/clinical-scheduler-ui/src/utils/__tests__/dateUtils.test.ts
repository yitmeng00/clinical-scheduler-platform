import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatDateTime,
  formatDisplayDate,
  formatLongDateRange,
  formatShortDate,
  formatShortDateRange,
  getGreeting,
  toISODate,
} from "../dateUtils";

describe("toISODate", () => {
  it("formats a date as YYYY-MM-DD", () => {
    // Use local constructor to avoid timezone shifts
    expect(toISODate(new Date(2024, 0, 15))).toBe("2024-01-15");
  });

  it("zero-pads single-digit months and days", () => {
    expect(toISODate(new Date(2024, 2, 5))).toBe("2024-03-05");
  });

  it("handles December correctly", () => {
    expect(toISODate(new Date(2024, 11, 31))).toBe("2024-12-31");
  });
});

describe("getGreeting", () => {
  afterEach(() => vi.useRealTimers());

  it("returns Good morning before noon", () => {
    vi.setSystemTime(new Date("2024-01-15T08:00:00"));
    expect(getGreeting()).toBe("Good morning");
  });

  it("returns Good afternoon from noon to 4:59pm", () => {
    vi.setSystemTime(new Date("2024-01-15T14:00:00"));
    expect(getGreeting()).toBe("Good afternoon");
  });

  it("returns Good evening from 5pm onwards", () => {
    vi.setSystemTime(new Date("2024-01-15T19:00:00"));
    expect(getGreeting()).toBe("Good evening");
  });

  it("boundary: midnight is Good morning", () => {
    vi.setSystemTime(new Date("2024-01-15T00:00:00"));
    expect(getGreeting()).toBe("Good morning");
  });

  it("boundary: noon is Good afternoon", () => {
    vi.setSystemTime(new Date("2024-01-15T12:00:00"));
    expect(getGreeting()).toBe("Good afternoon");
  });

  it("boundary: 17:00 is Good evening", () => {
    vi.setSystemTime(new Date("2024-01-15T17:00:00"));
    expect(getGreeting()).toBe("Good evening");
  });
});

describe("formatShortDate", () => {
  it("formats an ISO date string as abbreviated month and day", () => {
    expect(formatShortDate("2024-01-15")).toBe("Jan 15");
  });

  it("handles end-of-year dates", () => {
    expect(formatShortDate("2024-12-31")).toBe("Dec 31");
  });
});

describe("formatShortDateRange", () => {
  it("returns a single date label when start equals end", () => {
    expect(formatShortDateRange("2024-01-15", "2024-01-15")).toBe("Jan 15");
  });

  it("returns a dash-separated range when dates differ", () => {
    expect(formatShortDateRange("2024-01-15", "2024-01-20")).toBe(
      "Jan 15 – Jan 20",
    );
  });
});

describe("formatLongDateRange", () => {
  it("returns a single long date when start equals end", () => {
    expect(formatLongDateRange("2024-01-15", "2024-01-15")).toBe(
      "January 15, 2024",
    );
  });

  it("returns an em-dash-separated range when dates differ", () => {
    expect(formatLongDateRange("2024-01-15", "2024-01-20")).toBe(
      "January 15, 2024–January 20, 2024",
    );
  });
});

describe("formatDateTime", () => {
  it("includes the month abbreviation and day", () => {
    // Use a fixed UTC time; toLocaleString output depends on locale
    const result = formatDateTime("2024-01-15T14:30:00Z");
    expect(result).toMatch(/Jan 15/);
  });

  it("includes a time component (hours and minutes)", () => {
    const result = formatDateTime("2024-01-15T14:30:00Z");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("formatDisplayDate", () => {
  it("returns a long weekday + full date string for the given date", () => {
    const result = formatDisplayDate(new Date(2024, 0, 15)); // Mon Jan 15
    expect(result).toMatch(/Monday/);
    expect(result).toMatch(/January/);
    expect(result).toMatch(/2024/);
  });
});
