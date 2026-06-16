import { configureStore } from "@reduxjs/toolkit";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createElement, type ReactNode } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import authReducer, { setCredentials } from "../../features/auth/authSlice";
import { useGetSwapRequestsQuery } from "../../features/swaps/swapsApi";
import { server } from "../../test/mocks/server";
import type { AuthUser } from "../../types/auth";
import { api } from "../api";

const BASE = "http://localhost";

const mockUser: AuthUser = {
  id: 1,
  fullName: "Test User",
  initials: "TU",
  email: "test@hospital.org",
  role: "Nurse",
  department: "Emergency",
};

function makeStore() {
  return configureStore({
    reducer: { [api.reducerPath]: api.reducer, auth: authReducer },
    middleware: (m) => m().concat(api.middleware),
  });
}

describe("api baseQueryWithReauth", () => {
  it("dispatches logout when the refresh endpoint fails after a 401", async () => {
    server.use(
      http.get(
        `${BASE}/api/v1/swaps`,
        () => new HttpResponse(null, { status: 401 }),
      ),
      http.post(
        `${BASE}/api/v1/auth/refresh`,
        () => new HttpResponse(null, { status: 401 }),
      ),
    );
    const store = makeStore();
    store.dispatch(setCredentials({ token: "expired-token", user: mockUser }));

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(Provider, { store, children });

    renderHook(() => useGetSwapRequestsQuery(), { wrapper });

    await waitFor(() =>
      expect(store.getState().auth.isAuthenticated).toBe(false),
    );
    expect(store.getState().auth.token).toBeNull();
  });

  it("retries the original request and dispatches setCredentials when refresh succeeds", async () => {
    let swapsCallCount = 0;
    server.use(
      http.get(`${BASE}/api/v1/swaps`, () => {
        swapsCallCount += 1;
        if (swapsCallCount === 1)
          return new HttpResponse(null, { status: 401 });
        return HttpResponse.json([]);
      }),
      http.post(`${BASE}/api/v1/auth/refresh`, () =>
        HttpResponse.json({
          accessToken: "new-token",
          expiresIn: 3600,
          staff: mockUser,
        }),
      ),
    );
    const store = makeStore();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(Provider, { store, children });

    renderHook(() => useGetSwapRequestsQuery(), { wrapper });

    await waitFor(() => expect(store.getState().auth.token).toBe("new-token"));
    expect(swapsCallCount).toBe(2);
  });
});
