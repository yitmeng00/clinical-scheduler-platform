import { createBrowserRouter, Navigate } from "react-router-dom";

import AppContainer from "../components/layout/AppContainer";
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import LeavesPage from "../features/leaves/LeavesPage";
import SchedulePage from "../features/schedule/SchedulePage";
import AuditPage from "../features/audit/AuditPage";
import OvertimePage from "../features/overtime/OvertimePage";
import StaffPage from "../features/staff/StaffPage";
import SwapsPage from "../features/swaps/SwapsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <AppContainer />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      {
        path: "schedule",
        element: <SchedulePage />,
      },
      {
        path: "leaves",
        element: <LeavesPage />,
      },
      {
        path: "swaps",
        element: <SwapsPage />,
      },
      {
        path: "overtime",
        element: <OvertimePage />,
      },
      {
        path: "staff",
        element: <StaffPage />,
      },
      {
        path: "audit",
        element: <AuditPage />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
