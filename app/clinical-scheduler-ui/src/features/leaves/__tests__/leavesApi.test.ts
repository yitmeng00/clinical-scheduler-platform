import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createElement, type ReactNode } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";

import { api } from "../../../services/api";
import { server } from "../../../test/mocks/server";
import authReducer from "../../auth/authSlice";
import { useCancelLeaveMutation } from "../leavesApi";

const BASE = "http://localhost";

function makeStore() {
  return configureStore({
    reducer: { [api.reducerPath]: api.reducer, auth: authReducer },
    middleware: (m) => m().concat(api.middleware),
  });
}

describe("leavesApi", () => {
  it("calls DELETE /leaves/:id when the cancelLeave mutation is triggered", async () => {
    let called = false;
    server.use(
      http.delete(`${BASE}/api/v1/leaves/:id`, () => {
        called = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const store = makeStore();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(Provider, { store, children });

    const { result } = renderHook(() => useCancelLeaveMutation(), { wrapper });
    await act(async () => {
      result.current[0](1);
    });
    await waitFor(() => expect(called).toBe(true));
  });
});
