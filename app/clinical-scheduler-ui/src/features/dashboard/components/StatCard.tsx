import clsx from "clsx";
import { Link } from "react-router-dom";

export type StatCardVariant = "blue" | "amber" | "red" | "green";

interface StatCardProps {
  label: string;
  value: number | string;
  sub: string;
  variant: StatCardVariant;
  isLoading?: boolean;
  to?: string;
}

const VARIANT_STYLES: Record<StatCardVariant, string> = {
  blue: "text-accent",
  amber: "text-amber-500",
  red: "text-red-500",
  green: "text-emerald-500",
};

export default function StatCard({
  label,
  value,
  sub,
  variant,
  isLoading = false,
  to,
}: StatCardProps) {
  const inner = (
    <div
      className={clsx(
        "rounded-xl p-5 bg-white border border-slate-200 transition-all",
        to && "hover:border-slate-300 hover:shadow-sm cursor-pointer",
      )}
    >
      <div className={clsx("text-2xl font-bold mb-1", VARIANT_STYLES[variant])}>
        {isLoading ? "—" : value}
      </div>
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="no-underline block">
        {inner}
      </Link>
    );
  }

  return inner;
}
