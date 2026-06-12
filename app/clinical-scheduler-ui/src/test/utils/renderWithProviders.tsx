import { configureStore } from "@reduxjs/toolkit";
import { render, type RenderOptions } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import authReducer from "../../features/auth/authSlice";
import notificationsReducer, {
  type AppNotification,
} from "../../features/notifications/notificationsSlice";
import { api } from "../../services/api";
import type { AuthUser } from "../../types/auth";

interface PreloadedNotificationsState {
  items: AppNotification[];
}

interface RenderConfig {
  user?: AuthUser | null;
  token?: string | null;
  route?: string;
  preloadedState?: {
    notifications?: PreloadedNotificationsState;
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  config: RenderConfig = {},
  renderOptions?: Omit<RenderOptions, "wrapper">,
) {
  const { user = null, token = null, route = "/", preloadedState } = config;

  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
      notifications: notificationsReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    preloadedState: {
      auth: {
        token,
        user,
        isAuthenticated: !!user,
      },
      notifications: preloadedState?.notifications ?? { items: [] },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
