import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { mockUser } from "../../../test/mocks/fixtures";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import TopBar from "../TopBar";

function renderTopBar(
  notifications: Array<{
    id: string;
    message: string;
    type: "info" | "success" | "warning";
    read: boolean;
    at: string;
  }> = [],
) {
  return renderWithProviders(<TopBar />, {
    user: mockUser,
    preloadedState: { notifications: { items: notifications } },
  });
}

describe("TopBar", () => {
  it("renders the week range label", () => {
    renderTopBar();
    expect(screen.getByText(/Week \d+/)).toBeInTheDocument();
  });

  it("renders the system online status indicator", () => {
    renderTopBar();
    expect(screen.getByText("System online")).toBeInTheDocument();
  });

  it("renders the Notifications bell button", () => {
    renderTopBar();
    expect(
      screen.getByRole("button", { name: "Notifications" }),
    ).toBeInTheDocument();
  });

  it("shows an unread badge on the bell when there are unread notifications", () => {
    renderTopBar([
      {
        id: "1",
        message: "Test notification",
        type: "info",
        read: false,
        at: new Date().toISOString(),
      },
    ]);
    // The unread count badge should show "1"
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("opens the notification panel when the bell is clicked", async () => {
    const user = userEvent.setup();
    renderTopBar([
      {
        id: "1",
        message: "A recent notification",
        type: "info",
        read: false,
        at: new Date().toISOString(),
      },
    ]);
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("A recent notification")).toBeInTheDocument();
  });

  it("shows 'No notifications yet.' when panel is opened with no notifications", async () => {
    const user = userEvent.setup();
    renderTopBar();
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("No notifications yet.")).toBeInTheDocument();
  });

  it("formats a notification from minutes ago with 'Xm ago'", async () => {
    const user = userEvent.setup();
    // 5 minutes ago
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    renderTopBar([
      {
        id: "1",
        message: "Minutes-old notice",
        type: "info",
        read: false,
        at: fiveMinutesAgo,
      },
    ]);
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText(/\dm ago/)).toBeInTheDocument();
  });

  it("formats a notification from hours ago with 'Xh ago'", async () => {
    const user = userEvent.setup();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    renderTopBar([
      {
        id: "1",
        message: "Hours-old notice",
        type: "success",
        read: false,
        at: twoHoursAgo,
      },
    ]);
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText(/\dh ago/)).toBeInTheDocument();
  });

  it("formats a notification from days ago with 'Xd ago'", async () => {
    const user = userEvent.setup();
    const twoDaysAgo = new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000,
    ).toISOString();
    renderTopBar([
      {
        id: "1",
        message: "Days-old notice",
        type: "warning",
        read: false,
        at: twoDaysAgo,
      },
    ]);
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText(/\dd ago/)).toBeInTheDocument();
  });

  it("shows 'Mark all read' button when notification panel is open and has items", async () => {
    const user = userEvent.setup();
    renderTopBar([
      {
        id: "1",
        message: "Notice",
        type: "info",
        read: true,
        at: new Date().toISOString(),
      },
    ]);
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(
      screen.getByRole("button", { name: "Mark all read" }),
    ).toBeInTheDocument();
  });
});
