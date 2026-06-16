import type { AuditEntry } from "../../features/audit/auditApi";
import type { OvertimeRecord } from "../../features/overtime/overtimeApi";
import type { MyProfile } from "../../features/profile/profileApi";
import type { AuthUser } from "../../types/auth";
import type {
  DashboardStats,
  PendingLeave,
  TodayShift,
} from "../../types/dashboard";
import type { LeaveRequest } from "../../types/leave";
import type { Shift } from "../../types/shift";
import type { SwapRequest } from "../../types/swap";
import type { Department, StaffMember } from "../../types/user";

export const mockUser: AuthUser = {
  id: 8,
  fullName: "Mark Stevens",
  email: "m.stevens@hospital.org",
  role: "Receptionist",
  department: "Front Desk",
  initials: "MS",
};

export const mockAdminUser: AuthUser = {
  id: 12,
  fullName: "Admin User",
  email: "admin@hospital.org",
  role: "Admin",
  department: "Emergency",
  initials: "AU",
};

export const mockDeptLeadUser: AuthUser = {
  id: 10,
  fullName: "Dr. Marcus Kim",
  email: "m.kim@hospital.org",
  role: "DepartmentLead",
  department: "Emergency",
  initials: "MK",
};

export const mockDepartments: Department[] = [
  { id: 1, name: "Emergency", description: "Emergency department" },
  { id: 2, name: "Cardiology", description: "Cardiology department" },
  { id: 3, name: "Pediatrics", description: "Pediatrics department" },
  { id: 4, name: "ICU", description: "Intensive Care Unit" },
  { id: 5, name: "Front Desk", description: "Front desk and reception" },
];

export const mockStaffMember: StaffMember = {
  id: 8,
  fullName: "Mark Stevens",
  email: "m.stevens@hospital.org",
  role: "Receptionist",
  departmentId: 5,
  departmentName: "Front Desk",
  isActive: true,
  phone: "555-0108",
  initials: "MS",
  employmentType: "FullTime",
  createdAt: "2024-01-01T00:00:00Z",
};

export const mockDashboardStats: DashboardStats = {
  onDutyToday: 12,
  pendingLeaves: 3,
  overtimeAlerts: 2,
  activeStaff: 48,
};

export const mockTodayShifts: TodayShift[] = [
  {
    id: 1,
    staffName: "Dr. Sarah Chen",
    staffInitials: "SC",
    departmentName: "Emergency",
    shiftType: "Morning",
    startTime: "2024-01-15T07:00:00Z",
    endTime: "2024-01-15T15:00:00Z",
  },
];

export const mockPendingLeaves: PendingLeave[] = [
  {
    id: 1,
    staffName: "Emma White",
    staffInitials: "EW",
    departmentName: "Emergency",
    leaveType: "Annual",
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    daysCount: 5,
    reason: "Family vacation",
    submittedAt: "2024-01-10T10:00:00Z",
  },
];

export const mockLeaveRequest: LeaveRequest = {
  id: 1,
  staffId: 8,
  staffFullName: "Mark Stevens",
  staffInitials: "MS",
  staffDepartment: "Front Desk",
  leaveType: "Annual",
  startDate: "2024-03-01",
  endDate: "2024-03-05",
  durationDays: 5,
  reason: "Family vacation",
  status: "Pending",
  reviewNote: null,
  reviewedBy: null,
  reviewedAt: null,
  submittedAt: "2024-02-10T10:00:00Z",
  auditEntries: [],
};

export const mockApprovedLeave: LeaveRequest = {
  ...mockLeaveRequest,
  id: 2,
  staffFullName: "Emma White",
  staffInitials: "EW",
  status: "Approved",
  reviewedBy: "Admin User",
  reviewedAt: "2024-02-11T10:00:00Z",
  reviewNote: "Approved as requested",
  auditEntries: [
    {
      at: "2024-02-10T10:00:00Z",
      by: "Mark Stevens",
      action: "submitted",
      note: null,
    },
    {
      at: "2024-02-11T10:00:00Z",
      by: "Admin User",
      action: "approved",
      note: "Approved as requested",
    },
  ],
};

export const mockStaffMember2: StaffMember = {
  id: 9,
  fullName: "Emma White",
  email: "e.white@hospital.org",
  role: "Nurse",
  departmentId: 1,
  departmentName: "Emergency",
  isActive: true,
  phone: "555-0109",
  initials: "EW",
  employmentType: "FullTime",
  createdAt: "2024-01-01T00:00:00Z",
};

export const mockShift: Shift = {
  id: 1,
  staffId: 8,
  staffName: "Mark Stevens",
  staffInitials: "MS",
  departmentId: 5,
  departmentName: "Front Desk",
  startTime: "2026-06-16T07:00:00Z",
  endTime: "2026-06-16T15:00:00Z",
  shiftType: "Morning",
};

export const mockInactiveStaff: StaffMember = {
  ...mockStaffMember,
  id: 10,
  fullName: "Bob Johnson",
  email: "b.johnson@hospital.org",
  initials: "BJ",
  isActive: false,
};

export const mockLoginResponse = {
  accessToken: "mock-access-token",
  expiresIn: 900,
  staff: mockUser,
};

export const mockSwapRequest: SwapRequest = {
  id: 1,
  requesterId: 9,
  requesterName: "Emma White",
  requesterInitials: "EW",
  requesterDepartment: "Emergency",
  requesteeId: 8,
  requesteeName: "Mark Stevens",
  requesteeInitials: "MS",
  requesteeDepartment: "Front Desk",
  requesterShiftId: 2,
  requesterShiftDate: "2026-07-01",
  requesterShiftType: "Morning",
  requesteeShiftId: 1,
  requesteeShiftDate: "2026-07-02",
  requesteeShiftType: "Afternoon",
  reason: "Family appointment",
  status: "PendingRequestee",
  submittedAt: "2026-06-15T10:00:00Z",
  auditEntries: [],
};

export const mockOvertimeRecord: OvertimeRecord = {
  staffId: 8,
  fullName: "Mark Stevens",
  initials: "MS",
  department: "Front Desk",
  role: "Receptionist",
  employmentType: "FullTime",
  shiftCount: 6,
  totalHours: 48,
  regularHours: 40,
  overtimeHours: 8,
  isOvertime: true,
};

export const mockAuditEntry: AuditEntry = {
  at: "2026-06-15T10:00:00Z",
  category: "Leave",
  by: "Mark Stevens",
  action: "submitted",
  note: null,
  subject: "Annual Leave",
};

export const mockMyProfile: MyProfile = {
  id: 8,
  fullName: "Mark Stevens",
  email: "m.stevens@hospital.org",
  initials: "MS",
  role: "Receptionist",
  department: "Front Desk",
  phone: "555-0108",
  employmentType: "FullTime",
};
