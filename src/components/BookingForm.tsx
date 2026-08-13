'use client';

import React, { useState } from 'react';

interface BookingFormProps {
  onSubmit?: (data: any) => void;
}

export function BookingForm({ onSubmit }: BookingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    scheduledAt: '',
    reason: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateDate = (dateStr: string) => {
    return new Date(dateStr) > new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate required fields
    if (!formData.patientName || !formData.patientEmail || !formData.scheduledAt) {
      setError('Todos los campos son requeridos');
      return;
    }

    // Validate email
    if (!validateEmail(formData.patientEmail)) {
      setError('Email inválido');
      return;
    }

    // Validate date
    if (!validateDate(formData.scheduledAt)) {
      setError('Fecha en el pasado');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ patientName: '', patientEmail: '', scheduledAt: '', reason: '' });
        onSubmit?.(formData);
      } else {
        setError('Error al agendar');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-4">
      <div>
        <label htmlFor="patientName" className="block text-sm font-medium mb-1">Nombre</label>
        <input
          id="patientName"
          type="text"
          name="patientName"
          value={formData.patientName}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label htmlFor="patientEmail" className="block text-sm font-medium mb-1">Email</label>
        <input
          id="patientEmail"
          type="email"
          name="patientEmail"
          value={formData.patientEmail}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label htmlFor="scheduledAt" className="block text-sm font-medium mb-1">Fecha</label>
        <input
          id="scheduledAt"
          type="datetime-local"
          name="scheduledAt"
          value={formData.scheduledAt}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium mb-1">Motivo</label>
        <textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          rows={3}
        />
      </div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-700 rounded">Agendado exitosamente</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Agendando...' : 'Agendar'}
      </button>
    </form>
  );
}
