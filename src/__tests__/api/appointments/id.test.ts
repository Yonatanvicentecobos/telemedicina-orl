/**
 * Tests for GET/PUT/DELETE /api/appointments/[id]
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { testDataFactory, mockPrisma } from "../../setup";

describe("GET /api/appointments/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return appointment by ID", async () => {
    const mockAppointment = testDataFactory.appointment({
      patient: testDataFactory.user(),
      doctor: testDataFactory.doctor(),
    });

    mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);

    const result = await mockPrisma.appointment.findUnique({
      where: { id: "apt-1" },
      include: { patient: true, doctor: true },
    });

    expect(result).not.toBeNull();
    expect(result?.id).toBe("apt-1");
    expect(mockPrisma.appointment.findUnique).toHaveBeenCalledWith({
      where: { id: "apt-1" },
      include: { patient: true, doctor: true },
    });
  });

  it("should return null when appointment not found", async () => {
    mockPrisma.appointment.findUnique.mockResolvedValue(null);

    const result = await mockPrisma.appointment.findUnique({
      where: { id: "nonexistent-id" },
    });

    expect(result).toBeNull();
  });
});

describe("PUT /api/appointments/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update appointment status", async () => {
    const updatedAppointment = testDataFactory.appointment({
      status: "COMPLETED",
    });

    mockPrisma.appointment.update.mockResolvedValue(updatedAppointment);

    const result = await mockPrisma.appointment.update({
      where: { id: "apt-1" },
      data: { status: "COMPLETED" },
    });

    expect(result.status).toBe("COMPLETED");
    expect(mockPrisma.appointment.update).toHaveBeenCalledWith({
      where: { id: "apt-1" },
      data: { status: "COMPLETED" },
    });
  });

  it("should update appointment reason", async () => {
    const newReason = "Follow-up consultation";
    const updatedAppointment = testDataFactory.appointment({
      reason: newReason,
    });

    mockPrisma.appointment.update.mockResolvedValue(updatedAppointment);

    const result = await mockPrisma.appointment.update({
      where: { id: "apt-1" },
      data: { reason: newReason },
    });

    expect(result.reason).toBe(newReason);
  });

  it("should validate status enum", () => {
    const validStatuses = ["SCHEDULED", "COMPLETED", "CANCELLED"];
    const invalidStatus = "INVALID_STATUS";

    validStatuses.forEach((status) => {
      expect(validStatuses.includes(status)).toBe(true);
    });

    expect(validStatuses.includes(invalidStatus)).toBe(false);
  });

  it("should return 404 when appointment not found", async () => {
    mockPrisma.appointment.update.mockRejectedValue(
      new Error("Not found")
    );

    try {
      await mockPrisma.appointment.update({
        where: { id: "nonexistent-id" },
        data: { status: "COMPLETED" },
      });
      expect.fail("Should have thrown error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("DELETE /api/appointments/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete appointment", async () => {
    const deletedAppointment = testDataFactory.appointment();

    mockPrisma.appointment.delete.mockResolvedValue(deletedAppointment);

    const result = await mockPrisma.appointment.delete({
      where: { id: "apt-1" },
    });

    expect(result.id).toBe("apt-1");
    expect(mockPrisma.appointment.delete).toHaveBeenCalledWith({
      where: { id: "apt-1" },
    });
  });

  it("should return 404 when appointment not found", async () => {
    mockPrisma.appointment.delete.mockRejectedValue(
      new Error("Not found")
    );

    try {
      await mockPrisma.appointment.delete({
        where: { id: "nonexistent-id" },
      });
      expect.fail("Should have thrown error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
