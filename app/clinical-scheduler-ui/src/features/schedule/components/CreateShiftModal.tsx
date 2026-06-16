import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

import FormField from "../../../components/ui/FormField";
import { createShiftSchema } from "../../../schemas/shift";
import { useGetStaffListQuery } from "../../../services/staffApi";
import type { ApprovedLeave } from "../../../types/leave";

type CreateShiftFormValues = z.infer<typeof createShiftSchema>;
type ShiftTypeOption = "Morning" | "Afternoon" | "Night";

interface CreateShiftModalProps {
  defaultDate?: string;
  approvedLeaves: ApprovedLeave[];
  onSubmit: (values: CreateShiftFormValues) => Promise<void>;
  onClose: () => void;
  isSubmitting: boolean;
}

const SHIFT_TYPES: ShiftTypeOption[] = ["Morning", "Afternoon", "Night"];
const SHIFT_TIME_LABELS: Record<ShiftTypeOption, string> = {
  Morning: "07:00-15:00",
  Afternoon: "15:00-23:00",
  Night: "23:00-07:00",
};

export default function CreateShiftModal({
  defaultDate,
  approvedLeaves,
  onSubmit,
  onClose,
  isSubmitting,
}: CreateShiftModalProps) {
  const { data: staffList = [] } = useGetStaffListQuery();
  const [activeShiftType, setActiveShiftType] =
    useState<ShiftTypeOption>("Morning");

  const d = new Date();
  const todayISO = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateShiftFormValues>({
    resolver: zodResolver(createShiftSchema),
    defaultValues: { date: defaultDate ?? "", shiftType: "Morning" },
  });

  const watchedStaffId = Number(useWatch({ control, name: "staffId" }));
  const watchedDate = useWatch({ control, name: "date" });
  const staffOnLeave =
    watchedStaffId > 0 &&
    watchedDate &&
    approvedLeaves.some(
      (l) =>
        l.staffId === watchedStaffId &&
        l.startDate <= watchedDate &&
        l.endDate >= watchedDate,
    );
  const staffOnLeaveName = staffOnLeave
    ? (staffList.find((s) => s.id === watchedStaffId)?.fullName ??
      "This staff member")
    : null;

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">New Shift</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Staff Member" error={errors.staffId?.message}>
            <select
              {...register("staffId", {
                onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                  const member = staffList.find(
                    (s) => s.id === Number(e.target.value),
                  );
                  if (member)
                    setValue("departmentId", String(member.departmentId));
                },
              })}
              className="form-input w-full rounded-lg text-sm px-3 py-2 focus:outline-none"
            >
              <option value="">Select staff…</option>
              {staffList.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.fullName} — {member.departmentName}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Date" error={errors.date?.message}>
            <input
              type="date"
              min={todayISO}
              {...register("date")}
              className="form-input w-full rounded-lg text-sm px-3 py-2"
            />
          </FormField>

          <FormField label="Shift Type">
            <div className="flex gap-2">
              {SHIFT_TYPES.map((type) => (
                <label
                  key={type}
                  className={clsx(
                    "flex-1 text-center rounded-lg border py-2 text-sm cursor-pointer transition-colors",
                    activeShiftType === type
                      ? "bg-accent text-white border-accent"
                      : "border-slate-200 text-slate-600 hover:border-accent/50",
                  )}
                >
                  <input
                    type="radio"
                    value={type}
                    {...register("shiftType", {
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                        setActiveShiftType(e.target.value as ShiftTypeOption),
                    })}
                    className="sr-only"
                  />
                  <div className="font-medium">{type}</div>
                  <div className="text-xs opacity-75">
                    {SHIFT_TIME_LABELS[type]}
                  </div>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="Notes (optional)">
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Any special notes…"
              className="form-input w-full rounded-lg text-sm px-3 py-2 resize-none"
            />
          </FormField>

          {staffOnLeaveName && (
            <div className="flex gap-2 p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>
                <strong>{staffOnLeaveName}</strong> has an approved leave on
                this date. The shift cannot be created.
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!staffOnLeave}
              className={clsx(
                "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer",
                isSubmitting || staffOnLeave
                  ? "bg-accent/40 text-white cursor-not-allowed"
                  : "bg-accent text-white hover:bg-accent/90",
              )}
            >
              {isSubmitting ? "Creating…" : "Create Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
