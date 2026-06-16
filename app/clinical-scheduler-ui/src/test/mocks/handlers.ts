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
  http.put(`${BASE}/api/v1/staff/:id`, () =>
    HttpResponse.json(mockStaffMember),
  ),
  http.patch(`${BASE}/api/v1/staff/:id/toggle-active`, () =>
    HttpResponse.json(mockStaffMember),
  ),
  http.post(
    `${BASE}/api/v1/staff/:id/reset-password`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Leaves
  http.get(`${BASE}/api/v1/leaves`, () => HttpResponse.json([])),
  http.get(`${BASE}/api/v1/leaves/approved`, () => HttpResponse.json([])),
  http.post(`${BASE}/api/v1/leaves`, () =>
    HttpResponse.json({ id: 1 }, { status: 201 }),
  ),
  http.put(`${BASE}/api/v1/leaves/:id/review`, () =>
    HttpResponse.json({ id: 1 }),
  ),
  http.delete(
    `${BASE}/api/v1/leaves/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Shifts / Schedule
  http.get(`${BASE}/api/v1/shifts`, () => HttpResponse.json([])),
  http.post(`${BASE}/api/v1/shifts`, () =>
    HttpResponse.json({ id: 1 }, { status: 201 }),
  ),
  http.patch(`${BASE}/api/v1/shifts/:id`, () => HttpResponse.json({ id: 1 })),
  http.delete(
    `${BASE}/api/v1/shifts/:id`,
    () => new HttpResponse(null, { status: 204 }),
  ),

  // Swaps
  http.get(`${BASE}/api/v1/swaps`, () => HttpResponse.json([])),
  http.post(`${BASE}/api/v1/swaps`, () =>
    HttpResponse.json({ id: 1 }, { status: 201 }),
  ),
  http.patch(`${BASE}/api/v1/swaps/:id/review`, () =>
    HttpResponse.json({ id: 1 }),
  ),

  // Overtime
  http.get(`${BASE}/api/v1/overtime`, () => HttpResponse.json([])),

  // Audit
  http.get(`${BASE}/api/v1/audit`, () =>
    HttpResponse.json({ items: [], totalCount: 0, page: 1, pageSize: 20 }),
  ),

  // Profile
  http.get(`${BASE}/api/v1/profile`, () => HttpResponse.json(mockStaffMember)),
  http.put(`${BASE}/api/v1/profile`, () => HttpResponse.json(mockStaffMember)),
];
