import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { AuthUser } from "../../types/auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
}

const storedUser = localStorage.getItem("auth_user");

const initialState: AuthState = {
  token: null,
  user: storedUser ? (JSON.parse(storedUser) as AuthUser) : null,
  isAuthenticated: !!storedUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      localStorage.setItem("auth_user", JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth_user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;