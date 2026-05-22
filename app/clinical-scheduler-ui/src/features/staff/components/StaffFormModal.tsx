import { X } from "lucide-react";
import { useEffect, useState } from "react";

import FormField from "../../../components/ui/FormField";
import { useGetDepartmentsQuery } from "../../../services/departmentsApi";
import {
  useCreateStaffMutation,
  useUpdateStaffMutation,
} from "../../../services/staffApi";
import type { StaffMember } from "../../../types/user";

const ROLES = [
  "Admin",
  "DepartmentLead",
  "ChargeNurse",
  "Doctor",
  "Nurse",
  "Receptionist",
];

const ROLE_LABELS: Record<string, string> = {
  Admin: "Admin",
  DepartmentLead: "Department Lead",
  ChargeNurse: "Charge Nurse",
  Doctor: "Doctor",
  Nurse: "Nurse",
  Receptionist: "Receptionist",
};

const EMPLOYMENT_TYPES = ["FullTime", "PartTime", "Contract"];
const EMPLOYMENT_LABELS: Record<string, string> = {
  FullTime: "Full Time",
  PartTime: "Part Time",
  Contract: "Contract",
};

interface StaffFormModalProps {
  staff?: StaffMember;
  onClose: () => void;
}

export default function StaffFormModal({ staff, onClose }: StaffFormModalProps) {
  const isEdit = !!staff;
  const { data: departments = [] } = useGetDepartmentsQuery();
  const [createStaff, { isLoading: creating }] = useCreateStaffMutation();
  const [updateStaff, { isLoading: updating }] = useUpdateStaffMutation();
  const isLoading = creating || updating;

  const [fullName, setFullName] = useState(staff?.fullName ?? "");
  const [email, setEmail] = useState(staff?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(staff?.role ?? "Nurse");
  const [departmentId, setDepartmentId] = useState(
    staff?.departmentId?.toString() ?? "",
  );
  const [phone, setPhone] = useState(staff?.phone ?? "");
  const [employmentType, setEmploymentType] = useState(
    staff?.employmentType ?? "FullTime",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (departments.length > 0 && !departmentId) {
      setDepartmentId(String(departments[0].id));
    }
  }, [departments, departmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || (!isEdit && !password.trim())) {
      setError("Full name, email, and password are required.");
      return;
    }

    try {
      if (isEdit) {
        await updateStaff({
          id: staff.id,
          fullName: fullName.trim(),
          email: email.trim(),
          role,
          departmentId: Number(departmentId),
          phone: phone.trim() || undefined,
          employmentType,
        }).unwrap();
      } else {
        await createStaff({
          fullName: fullName.trim(),
          email: email.trim(),
          password: password.trim(),
          role,
          departmentId: Number(departmentId),
          phone: phone.trim() || undefined,
          employmentType,
        }).unwrap();
      }
      onClose();
    } catch {
      setError("Failed to save. The email may already be in use.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Edit Staff Member" : "Add Staff Member"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Full Name">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Jane Smith"
              className="form-input w-full rounded-lg text-sm px-3 py-2"
            />
          </FormField>

          <FormField label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.smith@hospital.org"
              className="form-input w-full rounded-lg text-sm px-3 py-2"
            />
          </FormField>

          {!isEdit && (
            <FormField label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Temporary password"
                className="form-input w-full rounded-lg text-sm px-3 py-2"
              />
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input w-full rounded-lg text-sm px-3 py-2 focus:outline-none"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Department">
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="form-input w-full rounded-lg text-sm px-3 py-2 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone (optional)">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="555-0100"
                className="form-input w-full rounded-lg text-sm px-3 py-2"
              />
            </FormField>

            <FormField label="Employment Type">
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="form-input w-full rounded-lg text-sm px-3 py-2 focus:outline-none"
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {EMPLOYMENT_LABELS[t]}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

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
              {isLoading ? "Saving…" : isEdit ? "Save Changes" : "Add Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}