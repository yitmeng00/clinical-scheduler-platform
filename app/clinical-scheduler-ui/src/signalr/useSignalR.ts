import type { HubConnection } from "@microsoft/signalr";
import { useEffect } from "react";

import { startScheduleHub, stopScheduleHub } from "./scheduleHubConnection";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { store } from "../app/store";
import { addNotification } from "../features/notifications/notificationsSlice";
import { api } from "../services/api";

const REVIEWER_ROLES = new Set(["Admin", "DepartmentLead", "ChargeNurse"]);

const getToken = async () => store.getState().auth.token ?? "";

export function useSignalR() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const joinGroups = async (hub: HubConnection) => {
      await hub.invoke("JoinUserGroup", String(user.id));
      if (REVIEWER_ROLES.has(user.role)) {
        await hub.invoke("JoinReviewerGroup");
      }
      await hub.invoke("JoinDepartment", user.department);
    };

    const connect = async () => {
      try {
        const hub = await startScheduleHub(getToken);
        if (cancelled) return;

        await joinGroups(hub);

        // Re-join groups after automatic reconnect — server drops all group
        // memberships when a connection drops and gets a new connection ID.
        hub.onreconnected(async () => {
          try {
            await joinGroups(hub);
          } catch {
            // ignore — will retry on next reconnect
          }
        });

        // Shift broadcast events — invalidate cache for the whole department
        hub.on("ShiftCreated", () =>
          dispatch(api.util.invalidateTags(["Shift"])),
        );
        hub.on("ShiftUpdated", () =>
          dispatch(api.util.invalidateTags(["Shift"])),
        );
        hub.on("ShiftDeleted", () =>
          dispatch(api.util.invalidateTags(["Shift"])),
        );

        // Targeted shift events — personal notifications for the assigned staff member
        hub.on(
          "ShiftAssigned",
          (payload: { shiftType: string; startTime: string }) => {
            const date = new Date(payload.startTime).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
              },
            );
            dispatch(
              addNotification({
                message: `A new ${payload.shiftType} shift has been assigned to you on ${date}`,
                type: "info",
              }),
            );
          },
        );
        hub.on(
          "ShiftRescheduled",
          (payload: { shiftType: string; startTime: string }) => {
            const date = new Date(payload.startTime).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
              },
            );
            dispatch(
              addNotification({
                message: `Your ${payload.shiftType} shift has been rescheduled to ${date}`,
                type: "info",
              }),
            );
          },
        );
        hub.on("ShiftRemoved", () => {
          dispatch(
            addNotification({
              message: "One of your scheduled shifts has been removed",
              type: "warning",
            }),
          );
        });

        // Leave events
        hub.on(
          "LeaveSubmitted",
          (payload: { staffName: string; leaveType: string }) => {
            dispatch(api.util.invalidateTags(["Leave"]));
            dispatch(
              addNotification({
                message: `${payload.staffName} submitted a ${payload.leaveType} leave request`,
                type: "info",
              }),
            );
          },
        );
        hub.on(
          "LeaveReviewed",
          (payload: { status: string; leaveType: string }) => {
            dispatch(api.util.invalidateTags(["Leave"]));
            dispatch(
              addNotification({
                message: `Your ${payload.leaveType} leave was ${payload.status.toLowerCase()}`,
                type: payload.status === "Approved" ? "success" : "warning",
              }),
            );
          },
        );

        // Swap events
        hub.on("SwapRequested", (payload: { requesterName: string }) => {
          dispatch(api.util.invalidateTags(["Swap"]));
          dispatch(
            addNotification({
              message: `${payload.requesterName} sent you a shift swap request`,
              type: "info",
            }),
          );
        });
        hub.on("SwapResponded", (payload: { requesteeName: string }) => {
          dispatch(api.util.invalidateTags(["Swap"]));
          dispatch(
            addNotification({
              message: `${payload.requesteeName} accepted a swap — review required`,
              type: "info",
            }),
          );
        });
        hub.on(
          "SwapReviewed",
          (payload: {
            status: string;
            requesterName: string;
            requesteeName: string;
          }) => {
            dispatch(api.util.invalidateTags(["Swap"]));
            dispatch(
              addNotification({
                message: `Swap between ${payload.requesterName} and ${payload.requesteeName} was ${payload.status.toLowerCase()}`,
                type: payload.status === "Approved" ? "success" : "warning",
              }),
            );
          },
        );
      } catch {
        // Connection failed — likely no token yet (post-refresh page load).
        // The store subscriber below will retry once the token arrives.
      }
    };

    // If a valid token is already in the store, connect immediately.
    // Otherwise wait for the /auth/refresh cycle to complete and set the token.
    if (store.getState().auth.token) {
      connect();
      return () => {
        cancelled = true;
        stopScheduleHub();
      };
    }

    const unsubscribe = store.subscribe(() => {
      if (store.getState().auth.token) {
        unsubscribe();
        if (!cancelled) connect();
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
      stopScheduleHub();
    };
  }, [user?.id, dispatch]);
}
