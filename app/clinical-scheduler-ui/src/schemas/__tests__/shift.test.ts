import { afterEach, describe, expect, it, vi } from "vitest";

import { createShiftSchema } from "../shift";

// Pin today so date-in-the-past validation is deterministic.
const TODAY = "2024-06-01";
const TOMORROW = "2024-06-02";
const YESTERDAY = "2024-05-31";

describe("createShiftSchema", () => {
  afterEach(() => vi.useRealTimers());

  beforeEach(() => {
    vi.setSystemTime(new Date(`${TODAY}T12:00:00`));
  });

  it("accepts a fully valid payload", () => {
    const result = createShiftSchema.safeParse({
      staffId: "8",
      departmentId: "1",
      date: TOMORROW,
      shiftType: "Morning",
      notes: "Cover for Dr. Chen",
    });
    expect(result.success).toBe(true);
  });

  it("accepts today as the shift date", () => {
    const result = createShiftSchema.safeParse({
      staffId: "8",
      departmentId: "1",
      date: TODAY,
      shiftType: "Afternoon",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a date in the past", () => {
    const result = createShiftSchema.safeParse({
      staffId: "8",
      departmentId: "1",
      date: YESTERDAY,
      shiftType: "Morning",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Date cannot be in the past");
  });

  it("rejects when staffId is empty", () => {
    const result = createShiftSchema.safeParse({
      staffId: "",
      departmentId: "1",
      date: TOMORROW,
      shiftType: "Morning",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Select a staff member");
  });

  it("rejects when date is empty", () => {
    const result = createShiftSchema.safeParse({
      staffId: "8",
      departmentId: "1",
      date: "",
      shiftType: "Morning",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid shiftType", () => {
    const result = createShiftSchema.safeParse({
      staffId: "8",
      departmentId: "1",
      date: TOMORROW,
      shiftType: "InvalidShift",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all three valid shift types", () => {
    for (const shiftType of ["Morning", "Afternoon", "Night"] as const) {
      const result = createShiftSchema.safeParse({
        staffId: "8",
        departmentId: "1",
        date: TOMORROW,
        shiftType,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts an optional notes field", () => {
    const withNotes = createShiftSchema.safeParse({
      staffId: "8",
      departmentId: "1",
      date: TOMORROW,
      shiftType: "Night",
      notes: "Extra cover",
    });
    const withoutNotes = createShiftSchema.safeParse({
      staffId: "8",
      departmentId: "1",
      date: TOMORROW,
      shiftType: "Night",
    });
    expect(withNotes.success).toBe(true);
    expect(withoutNotes.success).toBe(true);
  });
});
