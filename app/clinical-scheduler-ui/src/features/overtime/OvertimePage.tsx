import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { useGetOvertimeReportQuery } from "./overtimeApi";
import { toISODate } from "../../utils/dateUtils";

const ROLE_LABELS: Record<string, string> = {
  Admin: "Admin",
  DepartmentLead: "Dept Lead",
  ChargeNurse: "Charge Nurse",
  Doctor: "Doctor",
  Nurse: "Nurse",
  Receptionist: "Receptionist",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  FullTime: "Full Time",
  PartTime: "Part Time",
  Contract: "Contract",
};

const getMondayOf = (date: Date): Date => {
  const d = new Date(date);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatWeekLabel = (monday: Date): string => {
  const sunday = addDays(monday, 6);
  return `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${sunday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
};

export default function OvertimePage() {
  const [weekStart, setWeekStart] = useState(() => getMondayOf(new Date()));
  const weekEnd = addDays(weekStart, 6);

  const { data: records = [], isLoading } = useGetOvertimeReportQuery({
    from: toISODate(weekStart),
    to: toISODate(weekEnd),
  });

  const overtimeCount = records.filter((r) => r.isOvertime).length;
  const totalOvertimeHrs = records.reduce((s, r) => s + r.overtimeHours, 0);
  const totalScheduledHrs = records.reduce((s, r) => s + r.totalHours, 0);
  const totalShifts = records.reduce((s, r) => s + r.shiftCount, 0);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Overtime Tracker</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {overtimeCount > 0
            ? `${overtimeCount} staff member${overtimeCount !== 1 ? "s" : ""} with overtime this week`
            : "No overtime recorded this week"}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total overtime hrs",
            value: `${totalOvertimeHrs}h`,
            highlight: totalOvertimeHrs > 0,
          },
          {
            label: "Staff over 40h limit",
            value: overtimeCount,
            highlight: overtimeCount > 0,
          },
          {
            label: "Total scheduled hrs",
            value: `${totalScheduledHrs}h`,
            highlight: false,
          },
          {
            label: "Total shifts this week",
            value: totalShifts,
            highlight: false,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-slate-200 px-5 py-4"
          >
            <p
              className={clsx(
                "text-3xl font-bold",
                card.highlight ? "text-red-500" : "text-slate-900",
              )}
            >
              {card.value}
            </p>
            <p className="text-sm text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-3 mb-5">
        <button
          aria-label="Previous week"
          onClick={() => setWeekStart((w) => addDays(w, -7))}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-slate-700 min-w-56 text-center">
          Week of {formatWeekLabel(weekStart)}
        </span>
        <button
          aria-label="Next week"
          onClick={() => setWeekStart((w) => addDays(w, 7))}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Loading…
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No shifts recorded for this week.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">
                  Staff
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">
                  Department
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3 hidden lg:table-cell">
                  Type
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3">
                  Shifts
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3">
                  Total Hrs
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3">
                  Regular Hrs
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3">
                  Overtime
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.map((r) => (
                <tr
                  key={r.staffId}
                  className={clsx(
                    "transition-colors",
                    r.isOvertime ? "bg-orange-50/50" : "hover:bg-slate-50/60",
                  )}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={clsx(
                          "w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center shrink-0",
                          r.isOvertime
                            ? "bg-orange-100 text-orange-700"
                            : "bg-accent/10 text-accent",
                        )}
                      >
                        {r.initials}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {r.fullName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {ROLE_LABELS[r.role] ?? r.role}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-slate-600 hidden md:table-cell">
                    {r.department}
                  </td>
                  <td className="px-3 py-3.5 text-slate-500 hidden lg:table-cell">
                    {EMPLOYMENT_LABELS[r.employmentType] ?? r.employmentType}
                  </td>
                  <td className="px-3 py-3.5 text-slate-700 font-medium">
                    {r.shiftCount}
                  </td>
                  <td className="px-3 py-3.5 text-slate-700">
                    {r.totalHours}h
                  </td>
                  <td className="px-3 py-3.5 text-slate-500">
                    {r.regularHours}h
                  </td>
                  <td className="px-3 py-3.5">
                    {r.isOvertime ? (
                      <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
                        +{r.overtimeHours}h
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
