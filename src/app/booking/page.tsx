"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const router = useRouter();
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          patientEmail,
          scheduledAt: new Date(scheduledAt).toISOString(),
          reason: reason || undefined
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.formErrors?.join(", ") ?? "No se pudo agendar la cita");
      }
      const appointment = await res.json();
      router.push(`/consulta/${appointment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-clinic-bg flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-black/5 p-8 space-y-5"
      >
        <div>
          <h1 className="text-xl font-semibold text-clinic-text">Agenda tu consulta ORL</h1>
          <p className="text-sm text-clinic-muted mt-1">
            Videoconsulta con el Dr. Cobos, Otorrinolaringología.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-clinic-text">Nombre completo</label>
          <input
            required
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-clinic-text">Correo</label>
          <input
            required
            type="email"
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-clinic-text">Fecha y hora</label>
          <input
            required
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-primary"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-clinic-text">Motivo (opcional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clinic-primary"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-clinic-primary hover:bg-clinic-primaryDark text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-60"
        >
          {submitting ? "Agendando..." : "Confirmar cita"}
        </button>
      </form>
    </main>
  );
}
