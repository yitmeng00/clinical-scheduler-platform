import { api } from "../../services/api";
import type {
  DashboardStats,
  PendingLeave,
  TodayShift,
} from "../../types/dashboard";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => "/dashboard/stats",
      providesTags: ["Leave", "Shift", "Staff"],
    }),
    getTodayShifts: builder.query<TodayShift[], void>({
      query: () => "/dashboard/today-shifts",
      providesTags: ["Shift"],
    }),
    getPendingLeaves: builder.query<PendingLeave[], void>({
      query: () => "/dashboard/pending-leaves",
      providesTags: ["Leave"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetTodayShiftsQuery,
  useGetPendingLeavesQuery,
} = dashboardApi;
