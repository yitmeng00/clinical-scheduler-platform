import { api } from "../../services/api";

export interface AuditEntry {
  at: string;
  category: string;
  by: string;
  action: string;
  note: string | null;
  subject: string;
}

export const auditApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLog: builder.query<
      AuditEntry[],
      { from: string; to: string; category?: string }
    >({
      query: ({ from, to, category }) => ({
        url: "/audit",
        params: { from, to, ...(category ? { category } : {}) },
      }),
    }),
  }),
});

export const { useGetAuditLogQuery } = auditApi;
