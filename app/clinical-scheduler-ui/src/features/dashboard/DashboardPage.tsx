import PendingLeavesPanel from "./components/PendingLeavesPanel";
import StatCard from "./components/StatCard";
import type { StatCardVariant } from "./components/StatCard";
import TodayShiftsPanel from "./components/TodayShiftsPanel";
import {
  useGetDashboardStatsQuery,
  useGetPendingLeavesQuery,
  useGetTodayShiftsQuery,
} from "./dashboardApi";
import { useAppSelector } from "../../app/hooks";
import type { DashboardStats } from "../../types/dashboard";
import { formatDisplayDate, getGreeting } from "../../utils/dateUtils";

interface StatCardConfig {
  key: keyof DashboardStats;
  label: string;
  sub: string;
  variant: StatCardVariant;
  to: string;
}

const STAT_CARD_CONFIGS: StatCardConfig[] = [
  {
    key: "onDutyToday",
    label: "On Duty Today",
    sub: "shifts scheduled",
    variant: "blue",
    to: "/schedule",
  },
  {
    key: "pendingLeaves",
    label: "Pending Leave",
    sub: "awaiting review",
    variant: "amber",
    to: "/leaves",
  },
  {
    key: "overtimeAlerts",
    label: "Overtime Alerts",
    sub: "over 40 hrs this week",
    variant: "red",
    to: "/overtime",
  },
  {
    key: "activeStaff",
    label: "Active Staff",
    sub: "across departments",
    variant: "green",
    to: "/staff",
  },
];

const LEAVE_REVIEWER_ROLES = new Set(["Admin", "DepartmentLead"]);

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const canReviewLeave = user ? LEAVE_REVIEWER_ROLES.has(user.role) : false;

  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: todayShifts, isLoading: shiftsLoading } =
    useGetTodayShiftsQuery();
  const { data: pendingLeaves, isLoading: leavesLoading } =
    useGetPendingLeavesQuery(undefined, { skip: !canReviewLeave });

  return (
    <div className="p-4 lg:p-9 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {getGreeting()}, {user?.fullName?.split(" ")[0]}!
        </h1>
        <p className="text-sm text-slate-500 mt-1">{formatDisplayDate()}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARD_CONFIGS.map((config) => (
          <StatCard
            key={config.key}
            label={config.label}
            sub={config.sub}
            variant={config.variant}
            to={config.to}
            value={stats?.[config.key] ?? "—"}
            isLoading={statsLoading}
          />
        ))}
      </div>

      {/* Detail panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className={canReviewLeave ? "lg:col-span-2" : "lg:col-span-3"}>
          <TodayShiftsPanel shifts={todayShifts} isLoading={shiftsLoading} />
        </div>
        {canReviewLeave && (
          <PendingLeavesPanel
            leaves={pendingLeaves}
            isLoading={leavesLoading}
          />
        )}
      </div>
    </div>
  );
}
