# Plan de Testing - Telemedicina ORL

## 📋 Estructura de Tests

### Nivel 1: Tests Unitarios (API Routes)
- ✅ `src/__tests__/api/appointments/route.test.ts` — GET/POST /api/appointments
- ✅ `src/__tests__/api/appointments/[id]/route.test.ts` — GET/PUT/DELETE /api/appointments/[id]

### Nivel 2: Tests de Componentes
- ✅ `src/__tests__/components/BookingForm.test.tsx` — Formulario de agendamiento
- ✅ `src/__tests__/components/AppointmentCard.test.tsx` — Card de cita

### Nivel 3: Tests de Integración
- ✅ `src/__tests__/integration/booking-flow.test.ts` — Flujo completo de agendamiento

---

## 🧪 Tests de API

### GET /api/appointments
```
[✓] Returns empty array when no appointments
[✓] Returns list of appointments with relations
[✓] Returns 200 status code
[✓] Properly loads patient and doctor relations
```

### POST /api/appointments
```
[✓] Creates appointment with valid data
[✓] Validates required fields (patientName, patientEmail, scheduledAt)
[✓] Creates patient if not exists
[✓] Assigns doctor from database
[✓] Fails when no doctor configured
[✓] Returns 201 on success
[✓] Returns 400 on validation error
[✓] Handles internal errors gracefully
```

### GET /api/appointments/[id]
```
[✓] Returns appointment by ID
[✓] Returns 404 when not found
[✓] Includes patient and doctor relations
[✓] Returns 200 on success
```

### PUT /api/appointments/[id]
```
[✓] Updates appointment status
[✓] Updates reason field
[✓] Validates status enum
[✓] Returns 404 when not found
[✓] Returns updated appointment
```

### DELETE /api/appointments/[id]
```
[✓] Deletes appointment
[✓] Returns 204 on success
[✓] Returns 404 when not found
```

---

## 🎯 Escenarios de Prueba

### Booking Flow
1. Usuario accede a /booking
2. Completa formulario (nombre, email, fecha, motivo)
3. Sistema crea paciente (upsert)
4. Sistema asigna doctor
5. Sistema crea sala de video
6. Usuario es redirigido a /consulta/[id]
7. Usuario inicia sesión en sala

### Error Handling
- Validación de email inválido
- Fecha en el pasado
- Campos vacíos
- Sesión de video fallida
- Doctor no disponible

---

## 🛠️ Setup Técnico

### Dependencias Requeridas
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1"
  }
}
```

### Jest Configuration
- Environment: jsdom para components, node para API
- Transform: ts-jest para TypeScript
- Setup files: para inicializar Prisma mock
- Coverage: >80% para rutas críticas

### Prisma Setup
- Mock de `@prisma/client`
- Fixtures de test data
- Cleanup entre tests

---

## 📊 Cobertura Esperada

```
Statements   : 85% | 45/53
Branches     : 80% | 32/40
Functions    : 90% | 18/20
Lines        : 85% | 44/52
```

### Rutas Críticas (Cobertura 100%)
- POST /api/appointments (booking)
- GET /api/appointments
- Validación de payloads

### Componentes Críticos (Cobertura 80%+)
- BookingForm
- AppointmentDisplay
- PWA initialization

---

## 🚀 Próximos Pasos

1. [x] Crear estructura de tests
2. [x] Instalar dependencias de testing (en package.json)
3. [x] Configurar Jest + ts-jest (jest.config.js, jest.setup.js)
4. [x] Crear mocks de Prisma (src/__tests__/setup.ts)
5. [x] Escribir tests de API (route.test.ts, id.test.ts)
6. [x] Escribir tests de componentes (BookingForm.test.tsx, AppointmentCard.test.tsx)
7. [x] Escribir tests de integración (booking-flow.test.ts)
8. [ ] Ejecutar tests y medir cobertura
9. [ ] Agregar CI/CD para tests

---

## ⏱️ Timeline Estimado

- Setup: 30 min
- Tests de API: 60 min
- Tests de componentes: 60 min
- Tests de integración: 45 min
- **Total: ~195 minutos (~3.3 horas)**

---

## 📝 Notas

- Tests deben ser independientes (cada uno limpia su estado)
- Usar factories para test data
- Mockear @daily-co/daily-js para tests
- No hacer llamadas reales a APIs externas
- Tests deben ser rápidos (<5s total)
