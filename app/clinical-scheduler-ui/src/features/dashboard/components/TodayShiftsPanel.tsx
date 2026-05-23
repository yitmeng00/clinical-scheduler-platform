import clsx from "clsx";

import type { TodayShift } from "../../../types/dashboard";

interface TodayShiftsPanelProps {
  shifts?: TodayShift[];
  isLoading?: boolean;
}

const SHIFT_BADGE: Record<string, string> = {
  Morning: "bg-blue-100 text-blue-700",
  Afternoon: "bg-amber-100 text-amber-700",
  Night: "bg-indigo-100 text-indigo-700",
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3 animate-pulse">
      <div className="w-7 h-7 rounded-full bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-1/4" />
      </div>
      <div className="w-16 h-5 bg-slate-100 rounded" />
    </div>
  );
}

export default function TodayShiftsPanel({
  shifts,
  isLoading,
}: TodayShiftsPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 h-full flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-slate-900">Today's Shifts</h2>
        {!isLoading && shifts && (
          <span className="text-xs text-slate-400">
            {shifts.length} on duty
          </span>
        )}
      </div>
      <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
        ) : shifts && shifts.length > 0 ? (
          shifts.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0">
                {s.staffInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {s.staffName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {s.departmentName}
                </p>
              </div>
              <span
                className={clsx(
                  "text-xs px-2 py-0.5 rounded font-medium shrink-0",
                  SHIFT_BADGE[s.shiftType],
                )}
              >
                {s.shiftType}
              </span>
            </div>
          ))
        ) : (
          <p className="px-5 py-6 text-sm text-slate-400 text-center">
            No shifts scheduled for today.
          </p>
        )}
      </div>
    </div>
  );
}
