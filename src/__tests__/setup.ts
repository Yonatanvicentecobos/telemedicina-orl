/**
 * Test setup: Configure Prisma mocks and test utilities
 */

import { jest } from "@jest/globals";

// Mock Prisma client
const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    create: jest.fn(),
  },
  appointment: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

// Mock @daily-co/daily-js
const mockDailyAPI = {
  createRoom: jest.fn(async () => ({
    url: "https://mock-room.daily.co/test-room-123",
    room_name: "test-room-123",
  })),
};

// Test data factories
export const testDataFactory = {
  user: (overrides = {}) => ({
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    role: "PATIENT",
    createdAt: new Date(),
    ...overrides,
  }),

  doctor: (overrides = {}) => ({
    id: "doctor-1",
    name: "Dr. Test",
    email: "doctor@test.com",
    role: "DOCTOR",
    createdAt: new Date(),
    ...overrides,
  }),

  appointment: (overrides = {}) => ({
    id: "apt-1",
    patientId: "user-1",
    doctorId: "doctor-1",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    status: "SCHEDULED",
    reason: "Check-up",
    roomUrl: "https://mock-room.daily.co/test-room-123",
    createdAt: new Date(),
    ...overrides,
  }),
};

export { mockPrisma, mockDailyAPI };
