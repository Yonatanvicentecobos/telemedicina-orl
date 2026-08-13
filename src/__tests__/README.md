# Telemedicina ORL - Testing Guide

## Overview

This directory contains comprehensive test suites for the telemedicina-orl application:

- **API Tests** (`api/`) — Tests for Next.js API routes
- **Component Tests** (`components/`) — Tests for React components
- **Integration Tests** (`integration/`) — End-to-end workflow tests
- **Setup** (`setup.ts`) — Shared test utilities and mocks

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Test Structure

### API Tests

**`api/appointments/route.test.ts`** — GET/POST /api/appointments
- GET returns empty list or full list of appointments
- POST creates new appointment with validation
- Email validation
- Database error handling

**`api/appointments/id.test.ts`** — GET/PUT/DELETE /api/appointments/[id]
- GET retrieves specific appointment
- PUT updates appointment status or details
- DELETE removes appointment
- 404 handling for missing appointments

### Component Tests

**`components/BookingForm.test.tsx`** — Booking form component
- Field rendering and input handling
- Email validation
- Required field validation
- Form submission
- Loading state
- Success/error messages
- Date picker for future dates only

**`components/AppointmentCard.test.tsx`** — Appointment display card
- Display appointment details (patient, doctor, date, reason)
- Status badge with styling
- Action buttons (join, edit, cancel)
- Disabled states for non-scheduled appointments
- Video room URL display
- Countdown timer for upcoming appointments

### Integration Tests

**`integration/booking-flow.test.ts`** — Complete booking workflow
- Payload validation
- Patient upsert (create or update)
- Doctor assignment
- Video room creation
- Appointment creation
- Relationship verification
- Error handling for missing doctor
- Video room creation failure
- Database transaction rollback
- Concurrent appointment creation
- Status transitions
- Double-booking prevention

## Mocking Strategy

### Prisma Client Mock
```typescript
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
```

### Daily API Mock
```typescript
const mockDailyAPI = {
  createRoom: jest.fn(async () => ({
    url: "https://mock-room.daily.co/test-room-123",
    room_name: "test-room-123",
  })),
};
```

### Test Data Factory
```typescript
testDataFactory.user({ /* overrides */ })
testDataFactory.doctor({ /* overrides */ })
testDataFactory.appointment({ /* overrides */ })
```

## Coverage Targets

| Metric | Target | Status |
|--------|--------|--------|
| Statements | 85% | [CONFIG] |
| Branches | 80% | [CONFIG] |
| Functions | 90% | [CONFIG] |
| Lines | 85% | [CONFIG] |
| API Routes | 90% | [CONFIG] |

## Debugging Tests

### Run Specific Test File
```bash
npm test -- api/appointments/route.test.ts
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="should create appointment"
```

### Enable Debug Output
```bash
npm test -- --verbose
```

### Run Single Test
```bash
npm test -- api/appointments/route.test.ts -t "should return empty array"
```

## CI/CD Integration

Add to your CI pipeline:
```bash
npm run test:coverage
```

Coverage reports are generated in `coverage/` directory.

## Best Practices

1. **Test Independence** — Each test must clean up after itself
2. **Mock External Services** — Never make real API calls in tests
3. **Use Factories** — Create test data consistently with factories
4. **Clear Mocks** — Call `jest.clearAllMocks()` in beforeEach
5. **Descriptive Names** — Test names should describe behavior, not implementation
6. **Test Happy Path + Errors** — Cover both success and failure scenarios

## Troubleshooting

### Tests Not Running
- Ensure `jest.config.js` and `jest.setup.js` are in project root
- Check that `@jest/globals` is imported in test files
- Verify `jest` and related packages are installed

### Mock Not Working
- Ensure mock is defined before the test that uses it
- Check that `jest.clearAllMocks()` is called in `beforeEach`
- Verify mock function names match actual function calls

### Import Errors
- Check `moduleNameMapper` in `jest.config.js`
- Ensure paths match your project structure
- Verify TypeScript configuration includes test files

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library Docs](https://testing-library.com/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)
