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

    const connect = async () => {
      try {
        const hub = await startScheduleHub(getToken);
        if (cancelled) return;

        await hub.invoke("JoinUserGroup", String(user.id));
        if (REVIEWER_ROLES.has(user.role)) {
          await hub.invoke("JoinReviewerGroup");
        }
        await hub.invoke("JoinDepartment", user.department);

        // Live schedule updates — invalidate RTK Query cache so all views refresh
        hub.on("ShiftCreated", () =>
          dispatch(api.util.invalidateTags(["Shift"])),
        );
        hub.on("ShiftUpdated", () =>
          dispatch(api.util.invalidateTags(["Shift"])),
        );
        hub.on("ShiftDeleted", () =>
          dispatch(api.util.invalidateTags(["Shift"])),
        );

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
        // withAutomaticReconnect handles retries
      }
    };

    connect();

    return () => {
      cancelled = true;
      stopScheduleHub();
    };
  }, [user?.id, dispatch]);
}
