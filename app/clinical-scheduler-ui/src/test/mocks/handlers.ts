import { http, HttpResponse } from "msw";

import {
  mockDashboardStats,
  mockDepartments,
  mockLoginResponse,
  mockPendingLeaves,
  mockStaffMember,
  mockTodayShifts,
} from "./fixtures";

export const handlers = [
  // Auth
  http.post("/api/v1/auth/login", () => HttpResponse.json(mockLoginResponse)),
  http.post(
    "/api/v1/auth/logout",
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.post("/api/v1/auth/refresh", () => HttpResponse.json(mockLoginResponse)),

  // Dashboard
  http.get("/api/v1/dashboard/stats", () =>
    HttpResponse.json(mockDashboardStats),
  ),
  http.get("/api/v1/dashboard/today-shifts", () =>
    HttpResponse.json(mockTodayShifts),
  ),
  http.get("/api/v1/dashboard/pending-leaves", () =>
    HttpResponse.json(mockPendingLeaves),
  ),

  // Departments
  http.get("/api/v1/departments", () => HttpResponse.json(mockDepartments)),

  // Staff
  http.get("/api/v1/staff", () => HttpResponse.json([])),
  http.get("/api/v1/staff/management", () => HttpResponse.json([])),
  http.post("/api/v1/staff", () =>
    HttpResponse.json(mockStaffMember, { status: 201 }),
  ),
  http.put("/api/v1/staff/:id", () => HttpResponse.json(mockStaffMember)),
];
