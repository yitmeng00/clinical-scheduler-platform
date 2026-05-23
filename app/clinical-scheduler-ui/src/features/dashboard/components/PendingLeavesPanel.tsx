import type { PendingLeave } from "../../../types/dashboard";

interface PendingLeavesPanelProps {
  leaves?: PendingLeave[];
  isLoading?: boolean;
}

const LEAVE_TYPE_COLORS: Record<string, string> = {
  Annual: "bg-emerald-100 text-emerald-700",
  Sick: "bg-red-100 text-red-700",
  Training: "bg-blue-100 text-blue-700",
  Personal: "bg-purple-100 text-purple-700",
};

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3 animate-pulse">
      <div className="w-7 h-7 rounded-full bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
      <div className="w-14 h-5 bg-slate-100 rounded" />
    </div>
  );
}

const formatDateRange = (start: string, end: string, days: number): string => {
  const s = new Date(start).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const e = new Date(end).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return start === end ? s : `${s} – ${e} (${days}d)`;
};

export default function PendingLeavesPanel({
  leaves,
  isLoading,
}: PendingLeavesPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 h-full flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-slate-900">
          Pending Leave Requests
        </h2>
        {!isLoading && leaves && (
          <span className="text-xs text-slate-400">
            {leaves.length} pending
          </span>
        )}
      </div>
      <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
        ) : leaves && leaves.length > 0 ? (
          leaves.map((l) => (
            <div key={l.id} className="flex items-center gap-3 px-5 py-3">
              <div className="w-7 h-7 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0">
                {l.staffInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {l.staffName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {formatDateRange(l.startDate, l.endDate, l.daysCount)} ·{" "}
                  {l.departmentName}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${LEAVE_TYPE_COLORS[l.leaveType] ?? "bg-slate-100 text-slate-600"}`}
              >
                {l.leaveType}
              </span>
            </div>
          ))
        ) : (
          <p className="px-5 py-6 text-sm text-slate-400 text-center">
            No pending leave requests.
          </p>
        )}
      </div>
    </div>
  );
}
