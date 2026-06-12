import { afterEach, describe, expect, it } from "vitest";

import authReducer, { logout, setCredentials } from "../authSlice";
import { mockUser } from "../../../test/mocks/fixtures";

const empty = { token: null, user: null, isAuthenticated: false };

describe("authSlice", () => {
  afterEach(() => localStorage.clear());

  describe("setCredentials", () => {
    it("stores the token and user and sets isAuthenticated", () => {
      const state = authReducer(
        empty,
        setCredentials({ token: "abc123", user: mockUser }),
      );
      expect(state.token).toBe("abc123");
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it("persists the user to localStorage", () => {
      authReducer(empty, setCredentials({ token: "abc123", user: mockUser }));
      expect(JSON.parse(localStorage.getItem("auth_user")!)).toEqual(mockUser);
    });

    it("overwrites a previously stored user", () => {
      let state = authReducer(
        empty,
        setCredentials({ token: "t1", user: mockUser }),
      );
      const newUser = { ...mockUser, fullName: "Someone Else" };
      state = authReducer(
        state,
        setCredentials({ token: "t2", user: newUser }),
      );
      expect(state.user?.fullName).toBe("Someone Else");
      expect(state.token).toBe("t2");
    });
  });

  describe("logout", () => {
    it("clears token, user, and isAuthenticated", () => {
      const loggedIn = {
        token: "abc123",
        user: mockUser,
        isAuthenticated: true,
      };
      const state = authReducer(loggedIn, logout());
      expect(state.token).toBeNull();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it("removes the user from localStorage", () => {
      localStorage.setItem("auth_user", JSON.stringify(mockUser));
      authReducer({ token: "abc123", user: mockUser, isAuthenticated: true }, logout());
      expect(localStorage.getItem("auth_user")).toBeNull();
    });

    it("is safe to call on an already-logged-out state", () => {
      const state = authReducer(empty, logout());
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
