/**
 * Tests for AppointmentCard component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { AppointmentCard } from "../../components/AppointmentCard";
import { testDataFactory, mockPrisma } from "../setup";

describe("AppointmentCard Component", () => {
  const mockAppointment = testDataFactory.appointment({
    patient: testDataFactory.user(),
    doctor: testDataFactory.doctor(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render appointment details", () => {
    render(<AppointmentCard appointment={mockAppointment} />);

    expect(screen.getByText(/test user/i)).toBeInTheDocument();
    expect(screen.getByText(/dr\. test/i)).toBeInTheDocument();
    expect(screen.getByText(/check-up/i)).toBeInTheDocument();
    expect(screen.getByText(/scheduled/i)).toBeInTheDocument();
  });

  it("should format appointment date correctly", () => {
    const appointment = testDataFactory.appointment({
      scheduledAt: new Date("2026-08-20T14:00:00"),
    });

    render(<AppointmentCard appointment={appointment} />);

    expect(screen.getByText(/2026-08-20/i)).toBeInTheDocument();
    expect(screen.getByText(/14:00/i)).toBeInTheDocument();
  });

  it("should show status badge with correct styling", () => {
    const scheduled = testDataFactory.appointment({ status: "SCHEDULED" });
    const { rerender } = render(<AppointmentCard appointment={scheduled} />);

    expect(screen.getByText(/scheduled/i)).toHaveClass("badge-primary");

    const completed = testDataFactory.appointment({ status: "COMPLETED" });
    rerender(<AppointmentCard appointment={completed} />);

    expect(screen.getByText(/completed/i)).toHaveClass("badge-success");

    const cancelled = testDataFactory.appointment({ status: "CANCELLED" });
    rerender(<AppointmentCard appointment={cancelled} />);

    expect(screen.getByText(/cancelled/i)).toHaveClass("badge-danger");
  });

  it("should show action buttons", () => {
    render(<AppointmentCard appointment={mockAppointment} />);

    expect(screen.getByRole("button", { name: /iniciar consulta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  it("should handle join consultation click", async () => {
    const user = userEvent.setup();
    const mockOnJoin = jest.fn();

    render(
      <AppointmentCard
        appointment={mockAppointment}
        onJoinConsultation={mockOnJoin}
      />
    );

    const joinButton = screen.getByRole("button", { name: /iniciar consulta/i });
    await user.click(joinButton);

    expect(mockOnJoin).toHaveBeenCalledWith(mockAppointment.id);
  });

  it("should handle edit click", async () => {
    const user = userEvent.setup();
    const mockOnEdit = jest.fn();

    render(
      <AppointmentCard appointment={mockAppointment} onEdit={mockOnEdit} />
    );

    const editButton = screen.getByRole("button", { name: /editar/i });
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockAppointment.id);
  });

  it("should handle cancel click with confirmation", async () => {
    const user = userEvent.setup();
    const mockOnCancel = jest.fn();

    render(
      <AppointmentCard
        appointment={mockAppointment}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    await user.click(cancelButton);

    const confirmButton = await screen.findByRole("button", {
      name: /confirmar cancelación/i,
    });
    await user.click(confirmButton);

    expect(mockOnCancel).toHaveBeenCalledWith(mockAppointment.id);
  });

  it("should disable join button for non-scheduled appointments", () => {
    const completed = testDataFactory.appointment({ status: "COMPLETED" });

    render(<AppointmentCard appointment={completed} />);

    const joinButton = screen.getByRole("button", { name: /iniciar consulta/i });
    expect(joinButton).toBeDisabled();
  });

  it("should show video room URL when available", () => {
    render(<AppointmentCard appointment={mockAppointment} />);

    expect(screen.getByText(/https:\/\/mock-room\.daily\.co/i)).toBeInTheDocument();
  });

  it("should show patient name and doctor name", () => {
    const appointment = testDataFactory.appointment({
      patient: testDataFactory.user({ name: "Jane Smith" }),
      doctor: testDataFactory.doctor({ name: "Dr. Rodriguez" }),
    });

    render(<AppointmentCard appointment={appointment} />);

    expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    expect(screen.getByText(/dr\. rodriguez/i)).toBeInTheDocument();
  });

  it("should display reason of appointment", () => {
    const appointment = testDataFactory.appointment({
      reason: "Follow-up consultation",
    });

    render(<AppointmentCard appointment={appointment} />);

    expect(screen.getByText(/follow-up consultation/i)).toBeInTheDocument();
  });

  it("should show created date", () => {
    const createdDate = new Date("2026-08-10");
    const appointment = testDataFactory.appointment({ createdAt: createdDate });

    render(<AppointmentCard appointment={appointment} />);

    expect(screen.getByText(/agendado.*2026-08-10/i)).toBeInTheDocument();
  });

  it("should show countdown timer for upcoming appointments", () => {
    const future = new Date();
    future.setHours(future.getHours() + 2);

    const appointment = testDataFactory.appointment({ scheduledAt: future });

    render(<AppointmentCard appointment={appointment} showCountdown />);

    expect(screen.getByText(/en.*hora/i)).toBeInTheDocument();
  });

  it("should handle appointment update status", async () => {
    const user = userEvent.setup();
    mockPrisma.appointment.update.mockResolvedValue(
      testDataFactory.appointment({ status: "COMPLETED" })
    );

    const { rerender } = render(<AppointmentCard appointment={mockAppointment} />);

    const joinButton = screen.getByRole("button", { name: /iniciar consulta/i });
    await user.click(joinButton);

    await waitFor(() => {
      expect(mockPrisma.appointment.update).toHaveBeenCalled();
    });
  });
});
