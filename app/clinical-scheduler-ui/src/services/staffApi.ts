import { api } from "./api";
import type { StaffMember, StaffSummary } from "../types/user";

interface CreateStaffBody {
  fullName: string;
  email: string;
  password: string;
  role: string;
  departmentId: number;
  phone?: string;
  employmentType: string;
}

interface UpdateStaffBody {
  fullName: string;
  email: string;
  role: string;
  departmentId: number;
  phone?: string;
  employmentType: string;
}

export const staffApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStaffList: builder.query<StaffSummary[], void>({
      query: () => "/staff",
      providesTags: ["Staff"],
    }),

    getStaffManagementList: builder.query<StaffMember[], void>({
      query: () => "/staff/management",
      providesTags: ["Staff"],
    }),

    createStaff: builder.mutation<StaffMember, CreateStaffBody>({
      query: (body) => ({ url: "/staff", method: "POST", body }),
      invalidatesTags: ["Staff"],
    }),

    updateStaff: builder.mutation<
      StaffMember,
      { id: number } & UpdateStaffBody
    >({
      query: ({ id, ...body }) => ({
        url: `/staff/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Staff"],
    }),

    toggleStaffActive: builder.mutation<StaffMember, number>({
      query: (id) => ({ url: `/staff/${id}/toggle-active`, method: "PATCH" }),
      invalidatesTags: ["Staff"],
    }),

    resetStaffPassword: builder.mutation<
      void,
      { id: number; newPassword: string }
    >({
      query: ({ id, newPassword }) => ({
        url: `/staff/${id}/reset-password`,
        method: "POST",
        body: { newPassword },
      }),
    }),
  }),
});

export const {
  useGetStaffListQuery,
  useGetStaffManagementListQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useToggleStaffActiveMutation,
  useResetStaffPasswordMutation,
} = staffApi;
