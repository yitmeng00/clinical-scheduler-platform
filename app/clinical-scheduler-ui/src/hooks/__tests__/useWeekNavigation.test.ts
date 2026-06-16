import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useWeekNavigation } from "../useWeekNavigation";

// Pin to Wednesday 2024-01-17 so the Monday anchor is always 2024-01-15.
const WEDNESDAY = new Date("2024-01-17T12:00:00");

describe("useWeekNavigation", () => {
  afterEach(() => vi.useRealTimers());

  it("initialises with the Monday of the current week", () => {
    vi.setSystemTime(WEDNESDAY);
    const { result } = renderHook(() => useWeekNavigation());
    expect(result.current.weekStartIso).toBe("2024-01-15");
  });

  it("generates exactly 7 consecutive days", () => {
    vi.setSystemTime(WEDNESDAY);
    const { result } = renderHook(() => useWeekNavigation());
    expect(result.current.weekDays).toHaveLength(7);
  });

  it("week starts on Monday (getDay() === 1) and ends on Sunday (getDay() === 0)", () => {
    vi.setSystemTime(WEDNESDAY);
    const { result } = renderHook(() => useWeekNavigation());
    expect(result.current.weekDays[0].getDay()).toBe(1);
    expect(result.current.weekDays[6].getDay()).toBe(0);
  });

  it("each consecutive day is 24 hours apart", () => {
    vi.setSystemTime(WEDNESDAY);
    const { result } = renderHook(() => useWeekNavigation());
    const days = result.current.weekDays;
    for (let i = 1; i < days.length; i++) {
      expect(days[i].getDate() - days[i - 1].getDate()).toBe(1);
    }
  });

  it("weekLabel includes the start and end dates of the week", () => {
    vi.setSystemTime(WEDNESDAY);
    const { result } = renderHook(() => useWeekNavigation());
    expect(result.current.weekLabel).toMatch(/Jan 15/);
    expect(result.current.weekLabel).toMatch(/Jan 21/);
  });

  it("weekStartIso matches the first weekDay as ISO string", () => {
    vi.setSystemTime(WEDNESDAY);
    const { result } = renderHook(() => useWeekNavigation());
    const [y, m, d] = result.current.weekStartIso.split("-").map(Number);
    const day = result.current.weekDays[0];
    expect(day.getFullYear()).toBe(y);
    expect(day.getMonth() + 1).toBe(m);
    expect(day.getDate()).toBe(d);
  });

  describe("nextWeek", () => {
    it("advances weekStart by 7 days", () => {
      vi.setSystemTime(WEDNESDAY);
      const { result } = renderHook(() => useWeekNavigation());
      act(() => result.current.nextWeek());
      expect(result.current.weekStartIso).toBe("2024-01-22");
    });

    it("can be called multiple times", () => {
      vi.setSystemTime(WEDNESDAY);
      const { result } = renderHook(() => useWeekNavigation());
      act(() => result.current.nextWeek());
      act(() => result.current.nextWeek());
      expect(result.current.weekStartIso).toBe("2024-01-29");
    });
  });

  describe("prevWeek", () => {
    it("moves weekStart back by 7 days", () => {
      vi.setSystemTime(WEDNESDAY);
      const { result } = renderHook(() => useWeekNavigation());
      act(() => result.current.prevWeek());
      expect(result.current.weekStartIso).toBe("2024-01-08");
    });

    it("can be called multiple times", () => {
      vi.setSystemTime(WEDNESDAY);
      const { result } = renderHook(() => useWeekNavigation());
      act(() => result.current.prevWeek());
      act(() => result.current.prevWeek());
      expect(result.current.weekStartIso).toBe("2024-01-01");
    });
  });

  describe("goToToday", () => {
    it("resets to the current week after navigating away", () => {
      vi.setSystemTime(WEDNESDAY);
      const { result } = renderHook(() => useWeekNavigation());
      act(() => result.current.nextWeek());
      act(() => result.current.nextWeek());
      act(() => result.current.goToToday());
      expect(result.current.weekStartIso).toBe("2024-01-15");
    });

    it("is idempotent when already on the current week", () => {
      vi.setSystemTime(WEDNESDAY);
      const { result } = renderHook(() => useWeekNavigation());
      act(() => result.current.goToToday());
      expect(result.current.weekStartIso).toBe("2024-01-15");
    });
  });

  it("correctly anchors to Monday when today is Sunday", () => {
    vi.setSystemTime(new Date("2024-01-14T12:00:00")); // Sunday
    const { result } = renderHook(() => useWeekNavigation());
    // Sunday belongs to the week starting Mon 2024-01-08
    expect(result.current.weekStartIso).toBe("2024-01-08");
  });

  it("correctly anchors to Monday when today is already Monday", () => {
    vi.setSystemTime(new Date("2024-01-15T12:00:00")); // Monday
    const { result } = renderHook(() => useWeekNavigation());
    expect(result.current.weekStartIso).toBe("2024-01-15");
  });
});
