import { describe, expect, it } from "vitest";

import notificationsReducer, {
  addNotification,
  markAllRead,
} from "../notificationsSlice";

const empty = { items: [] };

describe("notificationsSlice", () => {
  describe("addNotification", () => {
    it("prepends a new notification to the list", () => {
      const state = notificationsReducer(
        empty,
        addNotification({ message: "Hello", type: "info" }),
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0].message).toBe("Hello");
      expect(state.items[0].type).toBe("info");
    });

    it("sets read to false and populates id and at", () => {
      const state = notificationsReducer(
        empty,
        addNotification({ message: "Test", type: "success" }),
      );
      expect(state.items[0].read).toBe(false);
      expect(state.items[0].id).toBeTruthy();
      expect(state.items[0].at).toBeTruthy();
    });

    it("puts the newest notification first", () => {
      let state = notificationsReducer(
        empty,
        addNotification({ message: "First", type: "info" }),
      );
      state = notificationsReducer(
        state,
        addNotification({ message: "Second", type: "info" }),
      );
      expect(state.items[0].message).toBe("Second");
      expect(state.items[1].message).toBe("First");
    });

    it("caps the list at 20 items", () => {
      let state = empty;
      for (let i = 0; i < 22; i++) {
        state = notificationsReducer(
          state,
          addNotification({ message: `Notification ${i}`, type: "info" }),
        );
      }
      expect(state.items).toHaveLength(20);
    });

    it("discards the oldest items when the cap is exceeded", () => {
      let state = empty;
      for (let i = 0; i < 22; i++) {
        state = notificationsReducer(
          state,
          addNotification({ message: `Notification ${i}`, type: "info" }),
        );
      }
      // Newest is at index 0, oldest remaining is at index 19
      expect(state.items[0].message).toBe("Notification 21");
      expect(state.items[19].message).toBe("Notification 2");
    });

    it("supports all three notification types", () => {
      for (const type of ["info", "success", "warning"] as const) {
        const state = notificationsReducer(
          empty,
          addNotification({ message: "msg", type }),
        );
        expect(state.items[0].type).toBe(type);
      }
    });
  });

  describe("markAllRead", () => {
    it("sets read to true on every item", () => {
      let state = notificationsReducer(
        empty,
        addNotification({ message: "A", type: "info" }),
      );
      state = notificationsReducer(
        state,
        addNotification({ message: "B", type: "warning" }),
      );
      state = notificationsReducer(state, markAllRead());
      expect(state.items.every((n) => n.read)).toBe(true);
    });

    it("is a no-op on an empty list", () => {
      const state = notificationsReducer(empty, markAllRead());
      expect(state.items).toHaveLength(0);
    });
  });
});
