import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";

import authReducer, { logout } from "../features/auth/authSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import { api } from "../services/api";

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  notifications: notificationsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function setupStore(preloadedState?: Partial<RootState>) {
  const listenerMiddleware = createListenerMiddleware();

  // Drop the previous user's cached API data on any sign-out (explicit or
  // failed token refresh) so the next user on this device never sees it.
  // This runs in the same tick as `logout`, so the auth guard unmounts all
  // data-consuming components before any query can refetch.
  listenerMiddleware.startListening({
    actionCreator: logout,
    effect: (_action, listenerApi) => {
      listenerApi.dispatch(api.util.resetApiState());
    },
  });

  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(api.middleware),
  });
}

export const store = setupStore();

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
