import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SubmitButton } from "./submit-button";

vi.mock("react-dom", async () => {
  const actual = await vi.importActual<typeof import("react-dom")>("react-dom");

  return {
    ...actual,
    useFormStatus: vi.fn(),
  };
});

import { useFormStatus } from "react-dom";

const mockedUseFormStatus = vi.mocked(useFormStatus);

describe("SubmitButton", () => {
  it('shows "Save check-in" when the form is idle', () => {
    mockedUseFormStatus.mockReturnValue({
      pending: false,
      data: null,
      method: null,
      action: null,
    });

    render(<SubmitButton />);

    expect(
      screen.getByRole("button", { name: /save check-in/i }),
    ).toBeInTheDocument();
  });

  it('shows "Saving..." and disables the button while submitting', () => {
    mockedUseFormStatus.mockReturnValue({
      pending: true,
      data: new FormData(),
      method: "post",
      action: "/check-in",
    });

    render(<SubmitButton />);

    const button = screen.getByRole("button", { name: /saving/i });

    expect(button).toBeDisabled();
    expect(button).toBeInTheDocument();
  });
});
