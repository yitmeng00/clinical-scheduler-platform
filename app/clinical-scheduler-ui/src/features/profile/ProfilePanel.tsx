import clsx from "clsx";
import { KeyRound, User, X } from "lucide-react";
import { useState } from "react";

import {
  useChangePasswordMutation,
  useGetMyProfileQuery,
} from "./profileApi";
import FormField from "../../components/ui/FormField";

const ROLE_LABELS: Record<string, string> = {
  Admin: "Admin",
  DepartmentLead: "Department Lead",
  ChargeNurse: "Charge Nurse",
  Doctor: "Doctor",
  Nurse: "Nurse",
  Receptionist: "Receptionist",
};

const ROLE_STYLE: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700",
  DepartmentLead: "bg-blue-100 text-blue-700",
  ChargeNurse: "bg-cyan-100 text-cyan-700",
  Doctor: "bg-indigo-100 text-indigo-700",
  Nurse: "bg-emerald-100 text-emerald-700",
  Receptionist: "bg-slate-100 text-slate-600",
};

const EMPLOYMENT_LABELS: Record<string, string> = {
  FullTime: "Full Time",
  PartTime: "Part Time",
  Contract: "Contract",
};

type Tab = "info" | "password";

interface ProfilePanelProps {
  onClose: () => void;
}

export default function ProfilePanel({ onClose }: ProfilePanelProps) {
  const [tab, setTab] = useState<Tab>("info");
  const { data: profile, isLoading } = useGetMyProfileQuery();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-300 bg-black/20"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 z-300 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">My Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {isLoading || !profile ? (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
            Loading…
          </div>
        ) : (
          <>
            {/* Avatar + name */}
            <div className="flex flex-col items-center gap-3 pt-8 pb-6 px-5">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent text-xl font-bold flex items-center justify-center">
                {profile.initials}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900">
                  {profile.fullName}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">{profile.email}</p>
                <span
                  className={clsx(
                    "inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold",
                    ROLE_STYLE[profile.role] ?? "bg-slate-100 text-slate-600",
                  )}
                >
                  {ROLE_LABELS[profile.role] ?? profile.role}
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-5">
              {(["info", "password"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={clsx(
                    "flex items-center gap-1.5 pb-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                    tab === t
                      ? "border-accent text-accent"
                      : "border-transparent text-slate-500 hover:text-slate-700",
                  )}
                >
                  {t === "info" ? <User size={14} /> : <KeyRound size={14} />}
                  {t === "info" ? "Info" : "Password"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {tab === "info" ? (
                <InfoTab profile={profile} />
              ) : (
                <PasswordTab />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

function InfoTab({ profile }: { profile: NonNullable<ReturnType<typeof useGetMyProfileQuery>["data"]> }) {
  const rows: { label: string; value: string }[] = [
    { label: "Department", value: profile.department },
    { label: "Employment", value: EMPLOYMENT_LABELS[profile.employmentType] ?? profile.employmentType },
    { label: "Phone", value: profile.phone ?? "—" },
    { label: "Email", value: profile.email },
  ];

  return (
    <div className="space-y-4">
      {rows.map(({ label, value }) => (
        <div key={label} className="bg-slate-50 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-sm text-slate-800 font-medium">{value}</p>
        </div>
      ))}
    </div>
  );
}

function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }

    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch {
      setError("Current password is incorrect.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Current Password">
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          className="form-input w-full rounded-lg text-sm px-3 py-2"
        />
      </FormField>

      <FormField label="New Password">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Min. 6 characters"
          className="form-input w-full rounded-lg text-sm px-3 py-2"
        />
      </FormField>

      <FormField label="Confirm New Password">
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter new password"
          className="form-input w-full rounded-lg text-sm px-3 py-2"
        />
      </FormField>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          Password changed successfully.
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-60 transition-colors cursor-pointer"
      >
        {isLoading ? "Saving…" : "Change Password"}
      </button>
    </form>
  );
}