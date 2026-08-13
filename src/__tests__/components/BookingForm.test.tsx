/**
 * Tests for BookingForm component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { BookingForm } from "../../components/BookingForm";
import { mockPrisma } from "../setup";

describe("BookingForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("should show validation error for invalid email", async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /agendar/i });

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it("should show error when required fields are empty", async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    const submitButton = screen.getByRole("button", { name: /agendar/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/requerido/i)).toBeInTheDocument();
    });
  });

  it("should submit form with valid data", async () => {
    const user = userEvent.setup();
    const mockSubmit = jest.fn();

    mockPrisma.appointment.create.mockResolvedValue({
      id: "apt-1",
      patientId: "user-1",
      doctorId: "doctor-1",
      scheduledAt: new Date(),
      status: "SCHEDULED",
      reason: "Consulta inicial",
      roomUrl: "https://daily.co/test",
      createdAt: new Date(),
    });

    render(<BookingForm onSubmit={mockSubmit} />);

    const nameInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const dateInput = screen.getByLabelText(/fecha/i);
    const reasonInput = screen.getByLabelText(/motivo/i);
    const submitButton = screen.getByRole("button", { name: /agendar/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(dateInput, "2026-08-20T14:00");
    await user.type(reasonInput, "Consulta inicial");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockPrisma.appointment.create).toHaveBeenCalled();
    });
  });

  it("should disable submit button while loading", async () => {
    const user = userEvent.setup();

    mockPrisma.appointment.create.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                id: "apt-1",
                patientId: "user-1",
                doctorId: "doctor-1",
                scheduledAt: new Date(),
                status: "SCHEDULED",
                reason: "Consulta",
                roomUrl: "https://daily.co/test",
                createdAt: new Date(),
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

  it("should validate that selected date is in the future", async () => {
    const user = userEvent.setup();
    render(<BookingForm />);

    const dateInput = screen.getByLabelText(/fecha/i) as HTMLInputElement;
    const submitButton = screen.getByRole("button", { name: /agendar/i });

    // Set date to past
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    await user.type(
      dateInput,
      pastDate.toISOString().slice(0, 16)
    );
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/fecha en el pasado/i)).toBeInTheDocument();
    });
  });

  it("should show success message after submission", async () => {
    const user = userEvent.setup();

    mockPrisma.appointment.create.mockResolvedValue({
      id: "apt-1",
      patientId: "user-1",
      doctorId: "doctor-1",
      scheduledAt: new Date(),
      status: "SCHEDULED",
      reason: "Consulta",
      roomUrl: "https://daily.co/test",
      createdAt: new Date(),
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
