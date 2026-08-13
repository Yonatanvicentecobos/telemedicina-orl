/**
 * Tests for BookingForm component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { BookingForm } from "../../components/BookingForm";
import { mockPrisma } from "../setup";

// Mock fetch globally
global.fetch = jest.fn();

describe("BookingForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it("should render form with all fields", () => {
    render(<BookingForm />);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/fecha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/motivo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /agendar/i })).toBeInTheDocument();
  });

  it("should update form fields on user input", async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/nombre/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");

    expect(nameInput.value).toBe("John Doe");
    expect(emailInput.value).toBe("john@example.com");
  });

  it("should have email input field", () => {
    render(<BookingForm />);
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.type).toBe("email");
  });

  it("should have name input field", () => {
    render(<BookingForm />);
    const nameInput = screen.getByLabelText(/nombre/i) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.type).toBe("text");
  });

  it("should submit form with valid data", async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "apt-1",
        patientId: "user-1",
        doctorId: "doctor-1",
        scheduledAt: new Date(),
        status: "SCHEDULED",
        reason: "Consulta inicial",
        roomUrl: "https://daily.co/test",
        createdAt: new Date(),
      }),
    });

    render(<BookingForm onSubmit={mockSubmit} />);

    const nameInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const dateInput = screen.getByLabelText(/fecha/i);
    const submitButton = screen.getByRole("button", { name: /agendar/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(dateInput, "2026-08-20T14:00");
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/appointments",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("should disable submit button while loading", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ id: "apt-1" }),
              }),
            500
          )
        )
    );

    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const dateInput = screen.getByLabelText(/fecha/i);
    const submitButton = screen.getByRole("button", {
      name: /agendar/i,
    }) as HTMLButtonElement;

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(dateInput, "2026-08-20T14:00");

    await user.click(submitButton);

    expect(submitButton.disabled).toBe(true);
  });

  it("should show date picker for scheduling", () => {
    render(<BookingForm />);

    const dateInput = screen.getByLabelText(/fecha/i);
    expect(dateInput).toHaveAttribute("type", "datetime-local");
  });

  it("should accept future dates", async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    const dateInput = screen.getByLabelText(/fecha/i) as HTMLInputElement;

    // Set date to future
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateStr = futureDate.toISOString().slice(0, 16);

    await user.type(dateInput, dateStr);

    expect(dateInput.value).toBeTruthy();
  });

  it("should show success message after submission", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "apt-1",
        patientId: "user-1",
        doctorId: "doctor-1",
        scheduledAt: new Date(),
        status: "SCHEDULED",
        reason: "Consulta",
        roomUrl: "https://daily.co/test",
        createdAt: new Date(),
      }),
    });

    render(<BookingForm />);

    const nameInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const dateInput = screen.getByLabelText(/fecha/i);
    const submitButton = screen.getByRole("button", { name: /agendar/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(dateInput, "2026-08-20T14:00");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/agendado exitosamente/i)).toBeInTheDocument();
    });
  });
});
