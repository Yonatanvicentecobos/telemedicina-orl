"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe, { DailyCall } from "@daily-co/daily-js";

type Appointment = {
  id: string;
  scheduledAt: string;
  status: string;
  roomUrl: string | null;
  patient: { name: string };
  doctor: { name: string };
};

export default function ConsultaPage({ params }: { params: { id: string } }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<DailyCall | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetch(`/api/appointments/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("No se encontró la cita");
        return res.json();
      })
      .then(setAppointment)
      .catch((err) => setError(err.message));
  }, [params.id]);

  useEffect(() => {
    return () => {
      callRef.current?.destroy();
    };
  }, []);

  function handleJoin() {
    if (!appointment?.roomUrl || !containerRef.current) return;
    const call = DailyIframe.createFrame(containerRef.current, {
      iframeStyle: { width: "100%", height: "100%", border: "0" },
      showLeaveButton: true
    });
    callRef.current = call;
    call.join({ url: appointment.roomUrl });
    setJoined(true);
  }

  if (error) {
    return (
      <main className="min-h-screen bg-clinic-bg flex items-center justify-center p-6">
        <p className="text-red-600 text-sm">{error}</p>
      </main>
    );
  }

  if (!appointment) {
    return (
      <main className="min-h-screen bg-clinic-bg flex items-center justify-center p-6">
        <p className="text-clinic-muted text-sm">Cargando cita...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-clinic-bg flex flex-col items-center p-6 gap-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-lg font-semibold text-clinic-text">
          Consulta con {appointment.doctor.name}
        </h1>
        <p className="text-sm text-clinic-muted">
          Paciente: {appointment.patient.name} ·{" "}
          {new Date(appointment.scheduledAt).toLocaleString("es-EC")}
        </p>
      </div>

      {!joined && (
        <button
          onClick={handleJoin}
          disabled={!appointment.roomUrl}
          className="rounded-lg bg-clinic-primary hover:bg-clinic-primaryDark text-white text-sm font-medium px-5 py-2.5 disabled:opacity-60"
        >
          {appointment.roomUrl ? "Entrar a la videoconsulta" : "Sala de video no disponible"}
        </button>
      )}

      <div
        ref={containerRef}
        className="w-full max-w-3xl aspect-video bg-black/90 rounded-2xl overflow-hidden"
      />
    </main>
  );
}
