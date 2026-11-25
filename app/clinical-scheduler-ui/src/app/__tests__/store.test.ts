import { describe, expect, it } from "vitest";

import { logout, setCredentials } from "../../features/auth/authSlice";
import { addNotification } from "../../features/notifications/notificationsSlice";
import { departmentsApi } from "../../services/departmentsApi";
import { mockUser } from "../../test/mocks/fixtures";
import { setupStore } from "../store";

describe("store", () => {
  it("clears cached API data and notifications on logout", async () => {
    const store = setupStore();
    store.dispatch(setCredentials({ token: "token", user: mockUser }));
    store.dispatch(addNotification({ message: "Shift assigned", type: "info" }));

    const query = store.dispatch(
      departmentsApi.endpoints.getDepartments.initiate(),
    );
    await query;
    query.unsubscribe();
    expect(Object.keys(store.getState().api.queries)).not.toHaveLength(0);

    store.dispatch(logout());

    expect(store.getState().api.queries).toEqual({});
    expect(store.getState().notifications.items).toEqual([]);
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it("keeps cached API data when the user is still signed in", async () => {
    const store = setupStore();
    store.dispatch(setCredentials({ token: "token", user: mockUser }));

    const query = store.dispatch(
      departmentsApi.endpoints.getDepartments.initiate(),
    );
    await query;
    query.unsubscribe();

    store.dispatch(setCredentials({ token: "refreshed", user: mockUser }));

    expect(Object.keys(store.getState().api.queries)).not.toHaveLength(0);
  });
});
