import { api } from "../../services/api";

export interface OvertimeRecord {
  staffId: number;
  fullName: string;
  initials: string;
  department: string;
  role: string;
  employmentType: string;
  shiftCount: number;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  isOvertime: boolean;
}

export const overtimeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getOvertimeReport: builder.query<
      OvertimeRecord[],
      { from: string; to: string }
    >({
      query: ({ from, to }) => ({ url: "/overtime", params: { from, to } }),
    }),
  }),
});

export const { useGetOvertimeReportQuery } = overtimeApi;
