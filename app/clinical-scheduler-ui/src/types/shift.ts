export type ShiftType = "Morning" | "Afternoon" | "Night";

export interface Shift {
  id: number;
  staffId: number;
  departmentId: number;
  staffName: string;
  staffInitials: string;
  departmentName: string;
  startTime: string;
  endTime: string;
  shiftType: ShiftType;
  notes?: string;
}
