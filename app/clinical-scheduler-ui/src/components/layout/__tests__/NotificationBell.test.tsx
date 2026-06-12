import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import TopBar from "../TopBar";
import { mockUser } from "../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import type { AppNotification } from "../../../features/notifications/notificationsSlice";

function makeNotification(
  overrides: Partial<AppNotification> = {},
): AppNotification {
  return {
    id: crypto.randomUUID(),
    message: "Test notification",
    type: "info",
    read: false,
    at: new Date().toISOString(),
    ...overrides,
  };
}

describe("NotificationBell", () => {
  it("shows no badge when there are no unread notifications", () => {
    renderWithProviders(<TopBar />, { user: mockUser });
    // Badge is only rendered when unread > 0
    expect(screen.queryByText(/^[1-9]/)).not.toBeInTheDocument();
  });

  it("shows the unread count when there are unread notifications", () => {
    renderWithProviders(<TopBar />, {
      user: mockUser,
      preloadedState: {
        notifications: {
          items: [makeNotification(), makeNotification()],
        },
      },
    });
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows '9+' when there are more than 9 unread notifications", () => {
    const items = Array.from({ length: 10 }, () => makeNotification());
    renderWithProviders(<TopBar />, {
      user: mockUser,
      preloadedState: { notifications: { items } },
    });
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("does not show a badge for read notifications", () => {
    renderWithProviders(<TopBar />, {
      user: mockUser,
      preloadedState: {
        notifications: {
          items: [makeNotification({ read: true }), makeNotification({ read: true })],
        },
      },
    });
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("opens the dropdown when the bell is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TopBar />, { user: mockUser });
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("shows the empty state message when there are no notifications", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TopBar />, { user: mockUser });
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("No notifications yet.")).toBeInTheDocument();
  });

  it("renders notification messages in the dropdown", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TopBar />, {
      user: mockUser,
      preloadedState: {
        notifications: {
          items: [makeNotification({ message: "Your shift was assigned" })],
        },
      },
    });
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Your shift was assigned")).toBeInTheDocument();
  });

  it("marks all notifications as read when the bell is opened", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<TopBar />, {
      user: mockUser,
      preloadedState: {
        notifications: { items: [makeNotification(), makeNotification()] },
      },
    });
    await user.click(screen.getByRole("button"));
    expect(
      store.getState().notifications.items.every((n) => n.read),
    ).toBe(true);
  });

  it("hides the badge after opening the bell", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TopBar />, {
      user: mockUser,
      preloadedState: {
        notifications: { items: [makeNotification()] },
      },
    });
    // Badge visible before click
    expect(screen.getByText("1")).toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    // Badge gone after click (all marked read)
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("closes the dropdown when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TopBar />, { user: mockUser });
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    // Click the fixed backdrop overlay
    await user.click(document.querySelector("div.fixed.inset-0")!);
    expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
  });

  it("shows the 'Mark all read' button when there are notifications", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TopBar />, {
      user: mockUser,
      preloadedState: {
        notifications: { items: [makeNotification({ read: true })] },
      },
    });
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Mark all read")).toBeInTheDocument();
  });
});
