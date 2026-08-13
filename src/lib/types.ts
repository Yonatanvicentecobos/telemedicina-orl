export const ROLES = ["PATIENT", "DOCTOR"] as const;
export type Role = (typeof ROLES)[number];

export const APPOINTMENT_STATUSES = ["SCHEDULED", "CANCELLED", "COMPLETED"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
