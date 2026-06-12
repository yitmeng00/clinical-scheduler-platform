import { http, HttpResponse } from "msw";

import {
  mockDashboardStats,
  mockDepartments,
  mockLoginResponse,
  mockPendingLeaves,
  mockStaffMember,
  mockTodayShifts,
} from "./fixtures";

// MSW v2 node mode (setupServer) requires absolute URLs — relative paths like
// "/api/v1/..." won't match requests to "http://localhost/api/v1/...".
const BASE = "http://localhost";

export const handlers = [
  // Auth
  http.post(`${BASE}/api/v1/auth/login`, () =>
    HttpResponse.json(mockLoginResponse),
  ),
  http.post(
    `${BASE}/api/v1/auth/logout`,
    () => new HttpResponse(null, { status: 204 }),
  ),
  http.post(`${BASE}/api/v1/auth/refresh`, () =>
    HttpResponse.json(mockLoginResponse),
  ),

  // Dashboard
  http.get(`${BASE}/api/v1/dashboard/stats`, () =>
    HttpResponse.json(mockDashboardStats),
  ),
  http.get(`${BASE}/api/v1/dashboard/today-shifts`, () =>
    HttpResponse.json(mockTodayShifts),
  ),
  http.get(`${BASE}/api/v1/dashboard/pending-leaves`, () =>
    HttpResponse.json(mockPendingLeaves),
  ),

  // Departments
  http.get(`${BASE}/api/v1/departments`, () =>
    HttpResponse.json(mockDepartments),
  ),

  // Staff
  http.get(`${BASE}/api/v1/staff`, () => HttpResponse.json([])),
  http.get(`${BASE}/api/v1/staff/management`, () => HttpResponse.json([])),
  http.post(`${BASE}/api/v1/staff`, () =>
    HttpResponse.json(mockStaffMember, { status: 201 }),
  ),
  http.put(`${BASE}/api/v1/staff/:id`, () => HttpResponse.json(mockStaffMember)),
];
