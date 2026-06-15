import type { AuthUser } from "../../types/auth";
import type {
  DashboardStats,
  PendingLeave,
  TodayShift,
} from "../../types/dashboard";
import type { LeaveRequest } from "../../types/leave";
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
    { at: "2024-02-10T10:00:00Z", by: "Mark Stevens", action: "submitted", note: null },
    { at: "2024-02-11T10:00:00Z", by: "Admin User", action: "approved", note: "Approved as requested" },
  ],
};

export const mockLoginResponse = {
  accessToken: "mock-access-token",
  expiresIn: 900,
  staff: mockUser,
};
