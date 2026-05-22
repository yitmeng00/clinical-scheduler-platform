import { api } from "./api";
import type { Department } from "../types/user";

export const departmentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDepartments: builder.query<Department[], void>({
      query: () => "/departments",
    }),
  }),
});

export const { useGetDepartmentsQuery } = departmentsApi;