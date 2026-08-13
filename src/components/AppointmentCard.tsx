'use client';

import React, { useState, useEffect } from 'react';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: Date | string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
  roomUrl?: string;
  createdAt: Date | string;
  patient?: { id: string; name: string; email: string };
  doctor?: { id: string; name: string; email: string };
}

interface AppointmentCardProps {
  appointment: Appointment;
  onJoinConsultation?: (id: string) => void;
  onEdit?: (id: string) => void;
  onCancel?: (id: string) => void;
  showCountdown?: boolean;
}

export function AppointmentCard({
  appointment,
  onJoinConsultation,
  onEdit,
  onCancel,
  showCountdown = false,
}: AppointmentCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const scheduledDate = new Date(appointment.scheduledAt);
  const createdDate = new Date(appointment.createdAt);
  const isScheduled = appointment.status === 'SCHEDULED';

  useEffect(() => {
    if (!showCountdown) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = scheduledDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`en ${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [showCountdown, scheduledDate]);

  const getBadgeClass = () => {
    switch (appointment.status) {
      case 'SCHEDULED':
        return 'badge-primary';
      case 'COMPLETED':
        return 'badge-success';
      case 'CANCELLED':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  const statusLabel = {
    SCHEDULED: 'Scheduled',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  }[appointment.status];

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">
            {appointment.patient?.name || 'Paciente'}
          </h3>
          <p className="text-sm text-gray-600">
            Dr. {appointment.doctor?.name || 'Médico'}
          </p>
        </div>
        <span className={`badge ${getBadgeClass()} px-2 py-1 rounded text-xs font-semibold`}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-2 mb-3 text-sm">
        <p>
          <strong>Fecha:</strong> {scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString()}
        </p>
        <p>
          <strong>Motivo:</strong> {appointment.reason || 'No especificado'}
        </p>
        <p>
          <strong>Agendado:</strong> {createdDate.toLocaleDateString()}
        </p>
        {appointment.roomUrl && (
          <p className="text-blue-600 break-all">{appointment.roomUrl}</p>
        )}
        {timeLeft && (
          <p className="text-orange-600 font-medium">{timeLeft}</p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onJoinConsultation?.(appointment.id)}
          disabled={!isScheduled}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-50"
        >
          Iniciar consulta
        </button>
        <button
          onClick={() => onEdit?.(appointment.id)}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
        >
          Editar
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm"
        >
          Cancelar
        </button>
      </div>

      {showConfirm && (
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm mb-2">¿Confirmar cancelación?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onCancel?.(appointment.id);
                setShowConfirm(false);
              }}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded"
            >
              Confirmar cancelación
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-2 py-1 bg-gray-400 text-white text-xs rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
