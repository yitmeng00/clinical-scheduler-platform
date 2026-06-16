import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { server } from "../../../test/mocks/server";
import { renderWithProviders } from "../../../test/utils/renderWithProviders";
import LoginPage from "../LoginPage";

const BASE = "http://localhost";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

describe("LoginPage", () => {
  it("renders the Sign in heading and subtitle", () => {
    renderWithProviders(<LoginPage />);
    expect(
      screen.getByRole("heading", { name: "Sign in" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter your credentials to access the scheduler."),
    ).toBeInTheDocument();
  });

  it("renders email, password fields and a Sign in button", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByPlaceholderText("you@hospital.org")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("shows validation errors when the form is submitted empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      await screen.findByText("Enter a valid email address"),
    ).toBeInTheDocument();
  });

  it("shows a validation error for an invalid email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    await user.type(
      screen.getByPlaceholderText("you@hospital.org"),
      "not-an-email",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      await screen.findByText("Enter a valid email address"),
    ).toBeInTheDocument();
  });

  it("shows 'Signing in…' while the request is in flight", async () => {
    const user = userEvent.setup();
    // Delay the response so we can observe the loading state.
    server.use(
      http.post(`${BASE}/api/v1/auth/login`, async () => {
        await new Promise((r) => setTimeout(r, 200));
        return HttpResponse.json({});
      }),
    );
    renderWithProviders(<LoginPage />);
    await user.type(
      screen.getByPlaceholderText("you@hospital.org"),
      "admin@hospital.org",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Signing in…")).toBeInTheDocument();
  });

  it("navigates to /dashboard after a successful login", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    await user.type(
      screen.getByPlaceholderText("you@hospital.org"),
      "m.stevens@hospital.org",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      }),
    );
  });

  it("shows a server error message on failed login", async () => {
    server.use(
      http.post(`${BASE}/api/v1/auth/login`, () =>
        HttpResponse.json({ title: "Invalid credentials" }, { status: 401 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    await user.type(
      screen.getByPlaceholderText("you@hospital.org"),
      "wrong@hospital.org",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("falls back to a generic error message when the API returns no title", async () => {
    server.use(
      http.post(
        `${BASE}/api/v1/auth/login`,
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);
    await user.type(
      screen.getByPlaceholderText("you@hospital.org"),
      "admin@hospital.org",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(
      await screen.findByText("Login failed. Please try again."),
    ).toBeInTheDocument();
  });
});
