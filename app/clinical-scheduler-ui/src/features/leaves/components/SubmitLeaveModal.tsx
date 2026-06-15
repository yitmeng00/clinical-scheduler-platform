import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import FormField from "../../../components/ui/FormField";
import {
  LEAVE_TYPE_LABELS,
  LEAVE_TYPES,
  type LeaveType,
} from "../../../types/leave";
import { useSubmitLeaveMutation } from "../leavesApi";

const schema = z
  .object({
    leaveType: z.string().min(1, "Select a leave type"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().min(1, "Reason is required").max(500),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

type FormValues = z.infer<typeof schema>;

interface SubmitLeaveModalProps {
  onClose: () => void;
}

const today = new Date().toISOString().slice(0, 10);

export default function SubmitLeaveModal({ onClose }: SubmitLeaveModalProps) {
  const [submitLeave, { isLoading }] = useSubmitLeaveMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { leaveType: "Annual", startDate: "", endDate: "" },
  });

  const onSubmit = async (values: FormValues) => {
    await submitLeave({
      leaveType: values.leaveType as LeaveType,
      startDate: values.startDate,
      endDate: values.endDate,
      reason: values.reason,
    }).unwrap();
    onClose();
  };

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
          <h2 className="text-lg font-semibold text-slate-900">
            Request Leave
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Leave Type" error={errors.leaveType?.message}>
            <select
              {...register("leaveType")}
              className="form-input w-full rounded-lg text-sm px-3 py-2 focus:outline-none"
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {LEAVE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Start Date" error={errors.startDate?.message}>
            <input
              type="date"
              min={today}
              {...register("startDate")}
              className="form-input w-full rounded-lg text-sm px-3 py-2"
            />
          </FormField>

          <FormField label="End Date" error={errors.endDate?.message}>
            <input
              type="date"
              min={today}
              {...register("endDate")}
              className="form-input w-full rounded-lg text-sm px-3 py-2"
            />
          </FormField>

          <FormField label="Reason" error={errors.reason?.message}>
            <textarea
              {...register("reason")}
              rows={3}
              placeholder="Briefly explain the reason for your leave…"
              className="form-input w-full rounded-lg text-sm px-3 py-2 resize-none"
            />
          </FormField>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isLoading ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
