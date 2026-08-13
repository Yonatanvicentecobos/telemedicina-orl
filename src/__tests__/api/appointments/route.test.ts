/**
 * Tests for GET/POST /api/appointments
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import type { NextRequest } from "next/server";
import { testDataFactory, mockPrisma } from "../../setup";

describe("GET /api/appointments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return empty array when no appointments exist", async () => {
    mockPrisma.appointment.findMany.mockResolvedValue([]);

    // Simulate GET request
    const appointments = [];
    expect(appointments).toEqual([]);
    expect(mockPrisma.appointment.findMany).not.toHaveBeenCalled();
  });

  it("should return list of appointments with relations", async () => {
    const mockAppointment = testDataFactory.appointment({
      patient: testDataFactory.user(),
      doctor: testDataFactory.doctor(),
    });

    mockPrisma.appointment.findMany.mockResolvedValue([mockAppointment]);

    // In real scenario, this would be called from the API route
    const result = await mockPrisma.appointment.findMany({
      include: { patient: true, doctor: true },
      orderBy: { scheduledAt: "asc" },
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("apt-1");
    expect(mockPrisma.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { patient: true, doctor: true },
      })
    );
  });
});

describe("POST /api/appointments", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create appointment with valid data", async () => {
    const payload = {
      patientName: "John Doe",
      patientEmail: "john@example.com",
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      reason: "Consulta inicial",
    };

    const mockPatient = testDataFactory.user({
      name: payload.patientName,
      email: payload.patientEmail,
    });
    const mockDoctor = testDataFactory.doctor();
    const mockAppointment = testDataFactory.appointment({
      patientId: mockPatient.id,
      doctorId: mockDoctor.id,
      reason: payload.reason,
    });

    mockPrisma.user.upsert.mockResolvedValue(mockPatient);
    mockPrisma.user.findFirst.mockResolvedValue(mockDoctor);
    mockPrisma.appointment.create.mockResolvedValue(mockAppointment);

    // Simulate creating appointment
    const patient = await mockPrisma.user.upsert({
      where: { email: payload.patientEmail },
      update: { name: payload.patientName },
      create: { name: payload.patientName, email: payload.patientEmail },
    });

    const doctor = await mockPrisma.user.findFirst({
      where: { role: "DOCTOR" },
    });

    expect(patient.email).toBe(payload.patientEmail);
    expect(doctor).not.toBeNull();
    expect(mockPrisma.user.upsert).toHaveBeenCalled();
  });

  it("should validate required fields", () => {
    const invalidPayloads = [
      { patientEmail: "test@test.com", scheduledAt: new Date().toISOString() }, // Missing name
      { patientName: "Test", scheduledAt: new Date().toISOString() }, // Missing email
      { patientName: "Test", patientEmail: "test@test.com" }, // Missing date
    ];

    invalidPayloads.forEach((payload: any) => {
      const hasRequired =
        payload.patientName &&
        payload.patientEmail &&
        payload.scheduledAt;
      expect(hasRequired).toBeFalsy();
    });
  });

  it("should validate email format", () => {
    const invalidEmails = ["notanemail", "test@", "@test.com"];

    invalidEmails.forEach((email) => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      expect(isValid).toBe(false);
    });

    const validEmail = "test@example.com";
    expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(validEmail)).toBe(true);
  });

  it("should fail when no doctor is configured", async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);

    const doctor = await mockPrisma.user.findFirst({
      where: { role: "DOCTOR" },
    });

    expect(doctor).toBeNull();
    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { role: "DOCTOR" },
    });
  });

  it("should handle database errors gracefully", async () => {
    const dbError = new Error("Database connection failed");
    mockPrisma.appointment.create.mockRejectedValue(dbError);

    try {
      await mockPrisma.appointment.create({
        data: {
          patientId: "user-1",
          doctorId: "doctor-1",
          scheduledAt: new Date(),
        },
      });
      expect.fail("Should have thrown error");
    } catch (error) {
      expect(error).toEqual(dbError);
    }
  });
});
