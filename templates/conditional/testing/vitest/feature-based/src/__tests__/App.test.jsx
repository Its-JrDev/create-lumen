import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "@/app/App";

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  });
});
