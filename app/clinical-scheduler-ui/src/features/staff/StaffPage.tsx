import clsx from "clsx";
import { KeyRound, Pencil, Plus, PowerOff, Search } from "lucide-react";
import { useState } from "react";

import ResetPasswordModal from "./components/ResetPasswordModal";
import StaffFormModal from "./components/StaffFormModal";
import { useAppSelector } from "../../app/hooks";
import { useGetDepartmentsQuery } from "../../services/departmentsApi";
import {
  useGetStaffManagementListQuery,
  useToggleStaffActiveMutation,
} from "../../services/staffApi";
import type { StaffMember } from "../../types/user";

const ROLE_LABELS: Record<string, string> = {
  Admin: "Admin",
  DepartmentLead: "Dept Lead",
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

export default function StaffPage() {
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === "Admin";

  const { data: staff = [], isLoading } = useGetStaffManagementListQuery();
  const { data: departments = [] } = useGetDepartmentsQuery();
  const [toggleActive] = useToggleStaffActiveMutation();

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showInactive, setShowInactive] = useState(false);

  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [resetting, setResetting] = useState<StaffMember | null>(null);

  const filtered = staff.filter((s) => {
    if (!showInactive && !s.isActive) return false;
    if (deptFilter !== "all" && s.departmentId !== Number(deptFilter))
      return false;
    if (roleFilter !== "all" && s.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !s.fullName.toLowerCase().includes(q) &&
        !s.email.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {staff.filter((s) => s.isActive).length} active ·{" "}
            {staff.filter((s) => !s.isActive).length} inactive
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Add Staff
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input w-full pl-8 pr-3 py-2 rounded-lg text-sm"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="form-input rounded-lg text-sm px-3 py-2 focus:outline-none"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="form-input rounded-lg text-sm px-3 py-2 focus:outline-none"
        >
          <option value="all">All Roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 cursor-pointer hover:border-slate-300 transition-colors">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded"
          />
          Show inactive
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-400">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No staff members found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">
                  Email
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3">
                  Role
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3 hidden lg:table-cell">
                  Department
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3 hidden lg:table-cell">
                  Type
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-3">
                  Status
                </th>
                {isAdmin && <th className="px-3 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((member) => (
                <tr
                  key={member.id}
                  className={clsx(
                    "transition-colors",
                    member.isActive
                      ? "hover:bg-slate-50/60"
                      : "bg-slate-50/40 opacity-60",
                  )}
                >
                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0">
                        {member.initials}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {member.fullName}
                        </p>
                        <p className="text-xs text-slate-400 md:hidden">
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-3 py-3.5 text-slate-500 hidden md:table-cell">
                    {member.email}
                  </td>

                  {/* Role */}
                  <td className="px-3 py-3.5">
                    <span
                      className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-medium",
                        ROLE_STYLE[member.role] ??
                          "bg-slate-100 text-slate-600",
                      )}
                    >
                      {ROLE_LABELS[member.role] ?? member.role}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-3 py-3.5 text-slate-600 hidden lg:table-cell">
                    {member.departmentName}
                  </td>

                  {/* Employment type */}
                  <td className="px-3 py-3.5 text-slate-500 hidden lg:table-cell">
                    {EMPLOYMENT_LABELS[member.employmentType] ??
                      member.employmentType}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3.5">
                    <span
                      className={clsx(
                        "px-2.5 py-1 rounded-full text-xs font-semibold",
                        member.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}
                  {isAdmin && (
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => setEditing(member)}
                          title="Edit"
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setResetting(member)}
                          title="Reset password"
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
                        >
                          <KeyRound size={13} />
                        </button>
                        <button
                          onClick={() => toggleActive(member.id)}
                          title={member.isActive ? "Deactivate" : "Reactivate"}
                          className={clsx(
                            "w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer",
                            member.isActive
                              ? "border-red-200 text-red-400 hover:bg-red-50 hover:border-red-300"
                              : "border-emerald-200 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-300",
                          )}
                        >
                          <PowerOff size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {addOpen && <StaffFormModal onClose={() => setAddOpen(false)} />}
      {editing && (
        <StaffFormModal staff={editing} onClose={() => setEditing(null)} />
      )}
      {resetting && (
        <ResetPasswordModal
          staff={resetting}
          onClose={() => setResetting(null)}
        />
      )}
    </div>
  );
}
