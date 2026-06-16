import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createElement, type ReactNode } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { api } from "../../../services/api";
import { server } from "../../../test/mocks/server";
import authReducer from "../../auth/authSlice";
import { useGetUpcomingShiftsQuery } from "../shiftsApi";

const BASE = "http://localhost";

function makeStore() {
  return configureStore({
    reducer: { [api.reducerPath]: api.reducer, auth: authReducer },
    middleware: (m) => m().concat(api.middleware),
  });
}

describe("shiftsApi", () => {
  it("calls GET /shifts/upcoming when useGetUpcomingShiftsQuery is triggered", async () => {
    let called = false;
    server.use(
      http.get(`${BASE}/api/v1/shifts/upcoming`, () => {
        called = true;
        return HttpResponse.json([]);
      }),
    );
    const store = makeStore();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(Provider, { store, children });
    renderHook(() => useGetUpcomingShiftsQuery(1), { wrapper });
    await act(async () => {});
    await waitFor(() => expect(called).toBe(true));
  });
});
