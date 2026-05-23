import clsx from "clsx";
import { Bell } from "lucide-react";
import { useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  markAllRead,
  type AppNotification,
} from "../../features/notifications/notificationsSlice";

const getWeekRange = (): string => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const year = sunday.getFullYear();
  const weekNum = getWeekNumber(monday);

  return `Week ${weekNum} · ${fmt(monday)} – ${fmt(sunday)}, ${year}`;
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const TYPE_DOT: Record<AppNotification["type"], string> = {
  info: "bg-accent",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
};

const formatRelative = (iso: string): string => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

function NotificationBell() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((s) => s.notifications.items);
  const unread = notifications.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setOpen((v) => !v);
    if (!open && unread > 0) dispatch(markAllRead());
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-190" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-200 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Notifications
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={() => dispatch(markAllRead())}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-sm text-slate-400 text-center">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={clsx(
                      "flex items-start gap-3 px-4 py-3",
                      !n.read && "bg-accent/5",
                    )}
                  >
                    <span
                      className={clsx(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        TYPE_DOT[n.type],
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 leading-snug">
                        {n.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatRelative(n.at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TopBar() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="sticky top-0 flex flex-col lg:flex-row items-end lg:items-center justify-center lg:justify-between no-print bg-white z-90 border-b border-b-slate-200 h-13 px-9">
      <div className="text-sm text-slate-500 flex gap-4">
        <span className="text-slate-400">{getWeekRange().split(" · ")[0]}</span>
        <span>{getWeekRange().split(" · ")[1]}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-500">
        {user && (
          <>
            <span className="text-slate-400 hidden sm:inline">
              {user.department}
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
          </>
        )}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>System online</span>
        </div>
        <NotificationBell />
      </div>
    </div>
  );
}
