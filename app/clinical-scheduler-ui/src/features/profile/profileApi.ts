import { api } from "../../services/api";

export interface MyProfile {
  id: number;
  fullName: string;
  email: string;
  initials: string;
  role: string;
  department: string;
  phone: string | null;
  employmentType: string;
}

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyProfile: builder.query<MyProfile, void>({
      query: () => "/profile",
    }),

    changePassword: builder.mutation<
      void,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: "/profile/password", method: "PUT", body }),
    }),
  }),
});

export const { useGetMyProfileQuery, useChangePasswordMutation } = profileApi;
