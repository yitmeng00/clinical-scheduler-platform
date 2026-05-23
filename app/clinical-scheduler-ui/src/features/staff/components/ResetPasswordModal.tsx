import { X } from "lucide-react";
import { useState } from "react";

import FormField from "../../../components/ui/FormField";
import { useResetStaffPasswordMutation } from "../../../services/staffApi";
import type { StaffMember } from "../../../types/user";

interface ResetPasswordModalProps {
  staff: StaffMember;
  onClose: () => void;
}

export default function ResetPasswordModal({
  staff,
  onClose,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resetPassword, { isLoading }] = useResetStaffPasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newPassword.trim()) {
      setError("Password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await resetPassword({ id: staff.id, newPassword }).unwrap();
      onClose();
    } catch {
      setError("Failed to reset password. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Reset Password
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{staff.fullName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="New Password">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="form-input w-full rounded-lg text-sm px-3 py-2"
            />
          </FormField>

          <FormField label="Confirm Password">
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="form-input w-full rounded-lg text-sm px-3 py-2"
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
              {isLoading ? "Saving…" : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
