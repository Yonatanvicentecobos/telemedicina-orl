import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createConsultRoom } from "@/lib/daily";

const bookingSchema = z.object({
  patientName: z.string().min(2),
  patientEmail: z.string().email(),
  scheduledAt: z.string().datetime(),
  reason: z.string().max(500).optional()
});

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    orderBy: { scheduledAt: "asc" },
    include: { patient: true }
  });
  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { patientName, patientEmail, scheduledAt, reason } = parsed.data;

  const doctor = await prisma.user.findFirst({ where: { role: "DOCTOR" } });
  if (!doctor) {
    return NextResponse.json(
      { error: "No hay médico configurado. Corre `npm run prisma:seed`." },
      { status: 500 }
    );
  }

  const patient = await prisma.user.upsert({
    where: { email: patientEmail },
    update: { name: patientName },
    create: { name: patientName, email: patientEmail, role: "PATIENT" }
  });

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId: doctor.id,
      scheduledAt: new Date(scheduledAt),
      reason
    }
  });

  let roomUrl: string | null = null;
  try {
    roomUrl = await createConsultRoom(appointment.id);
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { roomUrl }
    });
  } catch (err) {
    console.error("No se pudo crear la sala de video:", err);
  }

  return NextResponse.json({ ...appointment, roomUrl }, { status: 201 });
}
