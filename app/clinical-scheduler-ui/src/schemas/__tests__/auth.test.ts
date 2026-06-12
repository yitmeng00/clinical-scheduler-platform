import { describe, expect, it } from "vitest";

import { loginSchema } from "../auth";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "user@hospital.org",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Enter a valid email address",
    );
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({
      email: "user@hospital.org",
      password: "123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Password must be at least 6 characters",
    );
  });

  it("rejects an empty email", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@hospital.org",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when both fields are missing", () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error?.issues.length).toBeGreaterThanOrEqual(2);
  });

  it("accepts an email with subdomain", () => {
    const result = loginSchema.safeParse({
      email: "dr.smith@icu.hospital.org",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts exactly 6 character password", () => {
    const result = loginSchema.safeParse({
      email: "user@hospital.org",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });
});
