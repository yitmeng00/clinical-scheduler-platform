import { configureStore } from "@reduxjs/toolkit";
import { renderHook, act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createElement, type ReactNode } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { api } from "../../../services/api";
import { server } from "../../../test/mocks/server";
import { useLogoutMutation } from "../authApi";
import authReducer from "../authSlice";

const BASE = "http://localhost";

describe("authApi", () => {
  it("calls POST /auth/logout when the logout mutation is triggered", async () => {
    let called = false;
    server.use(
      http.post(`${BASE}/api/v1/auth/logout`, () => {
        called = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer, auth: authReducer },
      middleware: (m) => m().concat(api.middleware),
    });
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(Provider, { store, children });

    const { result } = renderHook(() => useLogoutMutation(), { wrapper });
    await act(async () => {
      result.current[0]();
    });
    await waitFor(() => expect(called).toBe(true));
  });
});
