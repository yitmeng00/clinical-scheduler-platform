import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface AppNotification {
  id: string;
  message: string;
  type: "info" | "success" | "warning";
  read: boolean;
  at: string;
}

interface NotificationsState {
  items: AppNotification[];
}

const notificationsSlice = createSlice({
  name: "notifications",
  initialState: { items: [] } as NotificationsState,
  reducers: {
    addNotification(
      state,
      action: PayloadAction<Pick<AppNotification, "message" | "type">>,
    ) {
      state.items.unshift({
        id: crypto.randomUUID(),
        message: action.payload.message,
        type: action.payload.type,
        read: false,
        at: new Date().toISOString(),
      });
      if (state.items.length > 20) state.items = state.items.slice(0, 20);
    },
    markAllRead(state) {
      state.items.forEach((n) => {
        n.read = true;
      });
    },
  },
});

export const { addNotification, markAllRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
