import { X } from "lucide-react";
import { useState } from "react";

import { useAppSelector } from "../../../app/hooks";
import FormField from "../../../components/ui/FormField";
import { useGetStaffListQuery } from "../../../services/staffApi";
import { useGetUpcomingShiftsQuery } from "../../schedule/shiftsApi";
import { useSubmitSwapMutation } from "../swapsApi";

interface RequestSwapModalProps {
  onClose: () => void;
}

const formatShift = (date: string, shiftType: string) => {
  const d = new Date(date + "T00:00:00");
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${shiftType}`;
};

export default function RequestSwapModal({ onClose }: RequestSwapModalProps) {
  const user = useAppSelector((s) => s.auth.user);
  const [myShiftId, setMyShiftId] = useState("");
  const [targetStaffId, setTargetStaffId] = useState("");
  const [theirShiftId, setTheirShiftId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: staffList = [] } = useGetStaffListQuery();
  const { data: myShifts = [] } = useGetUpcomingShiftsQuery(user!.id, {
    skip: !user,
  });
  const { data: theirShifts = [] } = useGetUpcomingShiftsQuery(
    Number(targetStaffId),
    { skip: !targetStaffId },
  );
  const [submitSwap, { isLoading }] = useSubmitSwapMutation();

  const otherStaff = staffList.filter((s) => s.id !== user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!myShiftId || !theirShiftId || !reason.trim()) {
      setError("All fields are required.");
      return;
    }
    try {
      await submitSwap({
        requesterShiftId: Number(myShiftId),
        requesteeShiftId: Number(theirShiftId),
        reason: reason.trim(),
      }).unwrap();
      onClose();
    } catch {
      setError("Failed to submit swap request. Please try again.");
    }
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
            Request Shift Swap
          </h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Your Shift">
            <select
              value={myShiftId}
              onChange={(e) => setMyShiftId(e.target.value)}
              className="form-input w-full rounded-lg text-sm px-3 py-2 focus:outline-none"
            >
              <option value="">Select your shift…</option>
              {myShifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatShift(
                    new Date(s.startTime).toISOString().slice(0, 10),
                    s.shiftType,
                  )}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Swap With">
            <select
              value={targetStaffId}
              onChange={(e) => {
                setTargetStaffId(e.target.value);
                setTheirShiftId("");
              }}
              className="form-input w-full rounded-lg text-sm px-3 py-2 focus:outline-none"
            >
              <option value="">Select staff member…</option>
              {otherStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} — {s.departmentName}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Their Shift">
            <select
              value={theirShiftId}
              onChange={(e) => setTheirShiftId(e.target.value)}
              disabled={!targetStaffId}
              className="form-input w-full rounded-lg text-sm px-3 py-2 focus:outline-none disabled:opacity-50"
            >
              <option value="">
                {targetStaffId
                  ? theirShifts.length === 0
                    ? "No upcoming shifts"
                    : "Select their shift…"
                  : "Select a staff member first…"}
              </option>
              {theirShifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatShift(
                    new Date(s.startTime).toISOString().slice(0, 10),
                    s.shiftType,
                  )}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Reason">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Briefly explain the reason for the swap…"
              className="form-input w-full rounded-lg text-sm px-3 py-2 resize-none"
            />
          </FormField>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

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
              {isLoading ? "Submitting…" : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
