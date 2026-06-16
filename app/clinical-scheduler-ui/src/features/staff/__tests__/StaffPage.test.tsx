import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  mockAdminUser,
  mockInactiveStaff,
  mockStaffMember,
  mockStaffMember2,
  mockUser,
} from "../../../test/mocks/fixtures";
import { server } from "../../../test/mocks/server";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import StaffPage from "../StaffPage";

const BASE = "http://localhost";

describe("StaffPage", () => {
  it("renders the Staff heading", () => {
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    expect(screen.getByRole("heading", { name: "Staff" })).toBeInTheDocument();
  });

  it("shows active and inactive counts after data loads", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember, mockInactiveStaff]),
      ),
    );
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    expect(await screen.findByText(/1 active/)).toBeInTheDocument();
    expect(screen.getByText(/1 inactive/)).toBeInTheDocument();
  });

  it("shows 'Add Staff' button for Admin", () => {
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    expect(
      screen.getByRole("button", { name: /Add Staff/ }),
    ).toBeInTheDocument();
  });

  it("does NOT show 'Add Staff' button for non-Admin", () => {
    renderWithProviders(<StaffPage />, { user: mockUser });
    expect(
      screen.queryByRole("button", { name: /Add Staff/ }),
    ).not.toBeInTheDocument();
  });

  it("shows empty state when no staff are returned", async () => {
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    expect(
      await screen.findByText("No staff members found."),
    ).toBeInTheDocument();
  });

  it("renders staff rows with name and email", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    expect(await screen.findByText("Mark Stevens")).toBeInTheDocument();
    // Email appears in both the desktop column and the mobile-only sub-line
    expect(
      screen.getAllByText("m.stevens@hospital.org").length,
    ).toBeGreaterThan(0);
  });

  it("shows role badge and Active status for active staff", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await screen.findByText("Mark Stevens");
    // "Active" only appears as the status badge — it's not in any filter dropdown
    expect(screen.getByText("Active")).toBeInTheDocument();
    // Role badge: "Receptionist" also appears in the role filter select,
    // so assert via getAllByText
    expect(screen.getAllByText("Receptionist").length).toBeGreaterThan(0);
  });

  it("shows action buttons (Edit, Reset password, Deactivate) for Admin", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await screen.findByText("Mark Stevens");
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset password" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Deactivate" }),
    ).toBeInTheDocument();
  });

  it("does NOT show action buttons for non-Admin", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    renderWithProviders(<StaffPage />, { user: mockUser });
    await screen.findByText("Mark Stevens");
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });

  it("shows 'Reactivate' button for inactive staff (Admin)", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockInactiveStaff]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    // Inactive staff are hidden by default; reveal them first
    await screen.findByText("No staff members found.");
    await user.click(screen.getByLabelText("Show inactive"));
    expect(await screen.findByText("Bob Johnson")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reactivate" }),
    ).toBeInTheDocument();
  });

  it("filters staff by search text", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember, mockStaffMember2]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await screen.findByText("Mark Stevens");
    await user.type(
      screen.getByPlaceholderText("Search name or email…"),
      "Emma",
    );
    expect(screen.getByText("Emma White")).toBeInTheDocument();
    expect(screen.queryByText("Mark Stevens")).not.toBeInTheDocument();
  });

  it("filters staff by department", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember, mockStaffMember2]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await screen.findByText("Mark Stevens");
    // Department filter select shows "All Departments" by default
    await user.selectOptions(
      screen.getByDisplayValue("All Departments"),
      String(mockStaffMember2.departmentId), // Emergency dept id = 1
    );
    expect(screen.getByText("Emma White")).toBeInTheDocument();
    expect(screen.queryByText("Mark Stevens")).not.toBeInTheDocument();
  });

  it("filters staff by role", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember, mockStaffMember2]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await screen.findByText("Mark Stevens");
    await user.selectOptions(screen.getByDisplayValue("All Roles"), "Nurse");
    expect(screen.getByText("Emma White")).toBeInTheDocument();
    expect(screen.queryByText("Mark Stevens")).not.toBeInTheDocument();
  });

  it("shows inactive staff when 'Show inactive' is checked", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember, mockInactiveStaff]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await screen.findByText("Mark Stevens");
    expect(screen.queryByText("Bob Johnson")).not.toBeInTheDocument();
    await user.click(screen.getByLabelText("Show inactive"));
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("opens StaffFormModal when 'Add Staff' is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await user.click(screen.getByRole("button", { name: /Add Staff/ }));
    expect(
      screen.getByRole("heading", { name: "Add Staff Member" }),
    ).toBeInTheDocument();
  });

  it("opens StaffFormModal in edit mode when Edit is clicked", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await user.click(await screen.findByRole("button", { name: "Edit" }));
    expect(
      screen.getByRole("heading", { name: "Edit Staff Member" }),
    ).toBeInTheDocument();
  });

  it("opens ResetPasswordModal when Reset password is clicked", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await user.click(
      await screen.findByRole("button", { name: "Reset password" }),
    );
    expect(
      screen.getByRole("heading", { name: "Reset Password" }),
    ).toBeInTheDocument();
  });

  it("calls PATCH toggle-active when the Deactivate button is clicked", async () => {
    let patchCalled = false;
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
      http.patch(`${BASE}/api/v1/staff/:id/toggle-active`, () => {
        patchCalled = true;
        return HttpResponse.json({ ...mockStaffMember, isActive: false });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await user.click(await screen.findByRole("button", { name: "Deactivate" }));
    await waitFor(() => expect(patchCalled).toBe(true));
  });

  it("closes Add Staff modal when Cancel is clicked inside it", async () => {
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await user.click(screen.getByRole("button", { name: /Add Staff/ }));
    expect(
      screen.getByRole("heading", { name: "Add Staff Member" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByRole("heading", { name: "Add Staff Member" }),
    ).not.toBeInTheDocument();
  });

  it("closes Edit Staff modal when Cancel is clicked inside it", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await user.click(await screen.findByRole("button", { name: "Edit" }));
    expect(
      screen.getByRole("heading", { name: "Edit Staff Member" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByRole("heading", { name: "Edit Staff Member" }),
    ).not.toBeInTheDocument();
  });

  it("closes Reset Password modal when Cancel is clicked inside it", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([mockStaffMember]),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await user.click(
      await screen.findByRole("button", { name: "Reset password" }),
    );
    expect(
      screen.getByRole("heading", { name: "Reset Password" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.queryByRole("heading", { name: "Reset Password" }),
    ).not.toBeInTheDocument();
  });

  it("renders fallback style for an unknown role and employment type", async () => {
    server.use(
      http.get(`${BASE}/api/v1/staff/management`, () =>
        HttpResponse.json([
          { ...mockStaffMember, role: "Volunteer", employmentType: "Casual" },
        ]),
      ),
    );
    renderWithProviders(<StaffPage />, { user: mockAdminUser });
    await screen.findByText("Mark Stevens");
    expect(screen.getByText("Volunteer")).toBeInTheDocument();
    expect(screen.getByText("Casual")).toBeInTheDocument();
  });
});
