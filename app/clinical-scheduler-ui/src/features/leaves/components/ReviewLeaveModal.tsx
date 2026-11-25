import clsx from "clsx";
import { Check, X } from "lucide-react";
import { useState } from "react";

import { useAppSelector } from "../../../app/hooks";
import type { LeaveRequest } from "../../../types/leave";
import { LEAVE_TYPE_LABELS } from "../../../types/leave";
import { formatDateTime, formatLongDateRange } from "../../../utils/dateUtils";
import { useCancelLeaveMutation, useReviewLeaveMutation } from "../leavesApi";

interface ReviewLeaveModalProps {
  leave: LeaveRequest;
  canReview: boolean;
  onClose: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Rejected: "bg-red-100 text-red-700",
};

const ACTION_LABEL: Record<string, string> = {
  submitted: "submitted this request",
  approved: "approved this request",
  rejected: "rejected this request",
};

export default function ReviewLeaveModal({
  leave,
  canReview,
  onClose,
}: ReviewLeaveModalProps) {
  const myId = useAppSelector((s) => s.auth.user?.id);
  const [note, setNote] = useState("");
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [reviewLeave, { isLoading: reviewing }] = useReviewLeaveMutation();
  const [cancelLeave, { isLoading: cancelling }] = useCancelLeaveMutation();

  const isLoading = reviewing || cancelling;
  // Mirrors the API rule: only the requester can cancel, and only while pending
  const canCancel = leave.staffId === myId && leave.status === "Pending";

  const handleReview = async (action: "Approve" | "Reject") => {
    await reviewLeave({
      id: leave.id,
      action,
      note: note || undefined,
    }).unwrap();
    onClose();
  };

  const handleCancel = async () => {
    setCancelError(null);
    try {
      await cancelLeave(leave.id).unwrap();
      onClose();
    } catch {
      setCancelError(
        "Couldn't cancel this request. It may have already been reviewed.",
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {LEAVE_TYPE_LABELS[leave.leaveType]}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {leave.staffFullName} · {leave.staffDepartment}
              </p>
            </div>
            <span
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-semibold shrink-0 ml-3",
                STATUS_STYLE[leave.status],
              )}
            >
              {leave.status}
            </span>
          </div>

          {/* Details card */}
          <div className="bg-slate-50 rounded-xl p-4 mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Dates
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {formatLongDateRange(leave.startDate, leave.endDate)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Duration
                </p>
                <p className="text-sm font-medium text-slate-800">
                  {leave.durationDays} day{leave.durationDays !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Reason
              </p>
              <p className="text-sm text-slate-700">{leave.reason}</p>
            </div>
            {leave.reviewNote && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Review Note
                </p>
                <p className="text-sm text-slate-700">{leave.reviewNote}</p>
              </div>
            )}
          </div>

          {/* Audit trail */}
          {leave.auditEntries.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Audit Trail
              </p>
              <div className="space-y-3">
                {leave.auditEntries.map((entry, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold">{entry.by}</span>{" "}
                        {ACTION_LABEL[entry.action] ?? entry.action}
                        {entry.note && (
                          <span className="text-slate-500">
                            {" "}
                            — {entry.note}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDateTime(entry.at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review actions — only for reviewers on pending leaves */}
          {canReview && leave.status === "Pending" && (
            <div className="mt-5 space-y-3">
              <div className="border-t border-slate-100 pt-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Add a note (optional)…"
                  className="form-input w-full rounded-xl text-sm px-3 py-2.5 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReview("Approve")}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <Check size={15} />
                  Approve
                </button>
                <button
                  onClick={() => handleReview("Reject")}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 disabled:opacity-60 transition-colors cursor-pointer"
                >
                  <X size={15} />
                  Reject
                </button>
              </div>
            </div>
          )}

          {cancelError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {cancelError}
            </p>
          )}

          <div className="flex gap-3 mt-3">
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl border border-red-200 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors cursor-pointer"
              >
                {cancelling ? "Cancelling…" : "Cancel Request"}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
