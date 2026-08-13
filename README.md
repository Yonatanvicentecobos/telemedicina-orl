# Telemedicina ORL — MVP

PWA para agendar y realizar videoconsultas de Otorrinolaringología.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind
- Prisma + SQLite (dev)
- Daily.co para videollamada
- Service worker manual para modo offline del cascarón de la app

## Arranque

```bash
cp .env.example .env      # completa DAILY_API_KEY con tu cuenta de Daily.co
npm install
npm run prisma:migrate    # crea la base SQLite local
npm run prisma:seed       # crea el usuario médico por defecto
npm run dev
```

Abre http://localhost:3000 → "Agendar consulta" → completa el formulario → te lleva a la sala de video.

## Alcance de este MVP
- Agenda de cita + creación automática de sala de video (Daily.co) al confirmar.
- Sin autenticación todavía: el paciente se identifica solo con nombre/correo al agendar.
- Un solo médico (seed). Multi-médico, pagos, historial clínico y notificaciones quedan para la siguiente iteración.
- Faltan los íconos reales del manifest (`/public/icon-192.png`, `/public/icon-512.png`) para que la instalación PWA se vea completa.

## Próximos pasos sugeridos
1. Autenticación (paciente y médico) antes de exponer esto fuera de local.
2. Panel del médico para ver/gestionar su agenda.
3. Recordatorios por correo/SMS antes de la cita.
4. Cobro online si se agrega la venta de la consulta (Stripe u otro).
