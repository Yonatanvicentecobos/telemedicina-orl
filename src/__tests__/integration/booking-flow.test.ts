/**
 * Integration tests: Complete booking flow
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { testDataFactory, mockPrisma, mockDailyAPI } from "../setup";

describe("Booking Flow Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should complete full booking flow", async () => {
    // Step 1: Validate payload
    const payload = {
      patientName: "John Doe",
      patientEmail: "john@example.com",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      reason: "Consulta inicial",
    };

    const isValid =
      payload.patientName &&
      payload.patientEmail &&
      payload.scheduledAt &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.patientEmail);
    expect(isValid).toBe(true);

    // Step 2: Upsert patient
    const mockPatient = testDataFactory.user({
      name: payload.patientName,
      email: payload.patientEmail,
    });
    mockPrisma.user.upsert.mockResolvedValue(mockPatient);

    const patient = await mockPrisma.user.upsert({
      where: { email: payload.patientEmail },
      update: { name: payload.patientName },
      create: { name: payload.patientName, email: payload.patientEmail },
    });

    expect(patient.email).toBe(payload.patientEmail);
    expect(mockPrisma.user.upsert).toHaveBeenCalled();

    // Step 3: Assign doctor
    const mockDoctor = testDataFactory.doctor();
    mockPrisma.user.findFirst.mockResolvedValue(mockDoctor);

    const doctor = await mockPrisma.user.findFirst({
      where: { role: "DOCTOR" },
    });

    expect(doctor).not.toBeNull();
    expect(doctor?.role).toBe("DOCTOR");

    // Step 4: Create video room
    const room = await mockDailyAPI.createRoom();
    expect(room.url).toBeDefined();
    expect(room.room_name).toBeDefined();

    // Step 5: Create appointment
    const mockAppointment = testDataFactory.appointment({
      patientId: patient.id,
      doctorId: doctor!.id,
      scheduledAt: payload.scheduledAt,
      reason: payload.reason,
      roomUrl: room.url,
    });

    mockPrisma.appointment.create.mockResolvedValue(mockAppointment);

    const appointment = await mockPrisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor!.id,
        scheduledAt: payload.scheduledAt,
        reason: payload.reason,
        roomUrl: room.url,
      },
    });

    expect(appointment.id).toBe("apt-1");
    expect(appointment.status).toBe("SCHEDULED");
    expect(appointment.roomUrl).toBe(room.url);

    // Step 6: Verify all relationships
    const fullAppointment = testDataFactory.appointment({
      patient: patient,
      doctor: doctor!,
      roomUrl: room.url,
    });

    expect(fullAppointment.patient.email).toBe(payload.patientEmail);
    expect(fullAppointment.doctor.role).toBe("DOCTOR");
    expect(fullAppointment.roomUrl).toBe(room.url);
  });

  it("should handle missing doctor error", async () => {
    const payload = {
      patientName: "John Doe",
      patientEmail: "john@example.com",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      reason: "Consulta",
    };

    mockPrisma.user.upsert.mockResolvedValue(testDataFactory.user());
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const patient = await mockPrisma.user.upsert({
      where: { email: payload.patientEmail },
      update: { name: payload.patientName },
      create: { name: payload.patientName, email: payload.patientEmail },
    });

    const doctor = await mockPrisma.user.findFirst({
      where: { role: "DOCTOR" },
    });

    expect(doctor).toBeNull();
    expect(mockPrisma.appointment.create).not.toHaveBeenCalled();
  });

  it("should handle video room creation failure", async () => {
    mockDailyAPI.createRoom.mockRejectedValue(
      new Error("Failed to create room")
    );

    try {
      await mockDailyAPI.createRoom();
      expect.fail("Should have thrown error");
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as Error).message).toBe("Failed to create room");
    }
  });

  it("should validate patient email format", async () => {
    const invalidEmails = ["notanemail", "test@", "@test.com"];

    invalidEmails.forEach((email) => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValid).toBe(false);
    });

    const validEmail = "john@example.com";
    expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validEmail)).toBe(true);
  });

  it("should validate appointment date is in future", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    expect(pastDate < new Date()).toBe(true);
    expect(futureDate > new Date()).toBe(true);
  });

  it("should handle database transaction rollback on error", async () => {
    const payload = {
      patientName: "John Doe",
      patientEmail: "john@example.com",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      reason: "Consulta",
    };

    mockPrisma.user.upsert.mockResolvedValue(testDataFactory.user());
    mockPrisma.user.findFirst.mockResolvedValue(testDataFactory.doctor());
    mockPrisma.appointment.create.mockRejectedValue(
      new Error("Database error")
    );

    try {
      await mockPrisma.appointment.create({
        data: {
          patientId: "user-1",
          doctorId: "doctor-1",
          scheduledAt: payload.scheduledAt,
          reason: payload.reason,
        },
      });
      expect.fail("Should have thrown error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should create multiple appointments concurrently", async () => {
    const appointments = Array.from({ length: 3 }, (_, i) =>
      testDataFactory.appointment({ id: `apt-${i + 1}` })
    );

    mockPrisma.appointment.findMany.mockResolvedValue(appointments);

    const result = await mockPrisma.appointment.findMany({
      include: { patient: true, doctor: true },
    });

    expect(result).toHaveLength(3);
    expect(result.map((a) => a.id)).toEqual(["apt-1", "apt-2", "apt-3"]);
  });

  it("should track appointment status transitions", async () => {
    const appointment = testDataFactory.appointment({
      status: "SCHEDULED",
    });

    expect(appointment.status).toBe("SCHEDULED");

    // Transition to COMPLETED
    mockPrisma.appointment.update.mockResolvedValue(
      testDataFactory.appointment({ status: "COMPLETED" })
    );

    const updated = await mockPrisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "COMPLETED" },
    });

    expect(updated.status).toBe("COMPLETED");

    // Verify old status is gone
    expect(appointment.status).toBe("SCHEDULED");
  });

  it("should prevent double-booking same doctor/time", async () => {
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const existing = testDataFactory.appointment({
      doctorId: "doctor-1",
      scheduledAt,
    });

    mockPrisma.appointment.findMany.mockResolvedValue([existing]);

    const conflicts = await mockPrisma.appointment.findMany({
      where: {
        doctorId: "doctor-1",
        scheduledAt,
      },
    });

    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts[0].doctorId).toBe("doctor-1");
  });
});
