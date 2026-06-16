import { describe, expect, it } from "vitest";

import { mockSwapRequest } from "../../../test/mocks/fixtures";
import type { SwapRequest } from "../../../types/swap";
import { selectSwapPendingCount } from "../swapsApi";

describe("selectSwapPendingCount", () => {
  it("counts PendingRequestee swaps", () => {
    const swaps: SwapRequest[] = [mockSwapRequest];
    expect(selectSwapPendingCount(swaps)).toBe(1);
  });

  it("counts PendingAdmin swaps", () => {
    const swaps: SwapRequest[] = [
      { ...mockSwapRequest, status: "PendingAdmin" },
    ];
    expect(selectSwapPendingCount(swaps)).toBe(1);
  });

  it("does not count Approved, Rejected, or Cancelled swaps", () => {
    const swaps: SwapRequest[] = [
      { ...mockSwapRequest, status: "Approved" },
      { ...mockSwapRequest, status: "Rejected" },
      { ...mockSwapRequest, status: "Cancelled" },
    ];
    expect(selectSwapPendingCount(swaps)).toBe(0);
  });

  it("counts both PendingRequestee and PendingAdmin together", () => {
    const swaps: SwapRequest[] = [
      { ...mockSwapRequest, status: "PendingRequestee" },
      { ...mockSwapRequest, status: "PendingAdmin" },
    ];
    expect(selectSwapPendingCount(swaps)).toBe(2);
  });
});
