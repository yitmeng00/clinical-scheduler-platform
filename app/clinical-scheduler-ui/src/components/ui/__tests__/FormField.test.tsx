import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FormField from "../FormField";

describe("FormField", () => {
  it("renders the label text", () => {
    render(
      <FormField label="Email address">
        <input />
      </FormField>,
    );
    expect(screen.getByText("Email address")).toBeInTheDocument();
  });

  it("renders children inside the field", () => {
    render(
      <FormField label="Name">
        <input placeholder="Enter name" />
      </FormField>,
    );
    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
  });

  it("renders the error message when provided", () => {
    render(
      <FormField label="Email" error="Invalid email">
        <input />
      </FormField>,
    );
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });

  it("does not render an error element when error is undefined", () => {
    render(
      <FormField label="Email">
        <input />
      </FormField>,
    );
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <FormField label="Range">
        <input placeholder="From" />
        <input placeholder="To" />
      </FormField>,
    );
    expect(screen.getByPlaceholderText("From")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("To")).toBeInTheDocument();
  });
});
