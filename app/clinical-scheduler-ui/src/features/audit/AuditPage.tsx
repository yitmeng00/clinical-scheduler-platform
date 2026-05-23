import clsx from "clsx";
import { useState } from "react";

import { useGetAuditLogQuery } from "./auditApi";
import { formatDateTime } from "../../utils/dateUtils";
import { toISODate } from "../../utils/dateUtils";

const CATEGORY_STYLE: Record<string, string> = {
  Leave: "bg-blue-100 text-blue-700",
  Swap: "bg-violet-100 text-violet-700",
};

const ACTION_STYLE: Record<string, string> = {
  submitted: "bg-slate-100 text-slate-600",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  accepted: "bg-teal-100 text-teal-700",
  cancelled: "bg-orange-100 text-orange-700",
};

const getDateRange = (preset: string): { from: Date; to: Date } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  switch (preset) {
    case "7d": {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      return { from, to: today };
    }
    case "30d": {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      return { from, to: today };
    }
    case "90d": {
      const from = new Date(today);
      from.setDate(from.getDate() - 89);
      return { from, to: today };
    }
    default: {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      return { from, to: today };
    }
  }
};

export default function AuditPage() {
  const [preset, setPreset] = useState("7d");
  const [category, setCategory] = useState("all");

  const { from, to } = getDateRange(preset);

  const { data: entries = [], isLoading } = useGetAuditLogQuery({
    from: toISODate(from),
    to: toISODate(to),
    category: category === "all" ? undefined : category,
  });

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {entries.length} event{entries.length !== 1 ? "s" : ""} in this period
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
          {[
            { value: "7d", label: "7 days" },
            { value: "30d", label: "30 days" },
            { value: "90d", label: "90 days" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPreset(opt.value)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                preset === opt.value
                  ? "bg-accent text-white"
                  : "text-slate-600 hover:bg-slate-50",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-input rounded-lg text-sm px-3 py-2 focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="Leave">Leave</option>
          <option value="Swap">Swap</option>
        </select>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading…</div>
      ) : entries.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-400">
          No audit events in this period.
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
          <div className="space-y-1">
            {entries.map((entry, i) => (
              <div key={i} className="flex gap-4 items-start pl-10 relative">
                <div
                  className={clsx(
                    "absolute left-2.5 top-3.5 w-3 h-3 rounded-full border-2 border-white",
                    entry.category === "Leave" ? "bg-blue-400" : "bg-violet-400",
                  )}
                />
                <div className="flex-1 bg-white rounded-xl border border-slate-100 px-4 py-3 hover:border-slate-200 transition-colors">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-full text-xs font-semibold",
                        CATEGORY_STYLE[entry.category] ?? "bg-slate-100 text-slate-600",
                      )}
                    >
                      {entry.category}
                    </span>
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                        ACTION_STYLE[entry.action] ?? "bg-slate-100 text-slate-600",
                      )}
                    >
                      {entry.action}
                    </span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {formatDateTime(entry.at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">{entry.by}</span>{" "}
                    <span className="text-slate-500">{entry.action}</span>{" "}
                    <span className="font-medium">{entry.subject}</span>
                  </p>
                  {entry.note && (
                    <p className="text-xs text-slate-400 mt-1 italic">
                      "{entry.note}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}