# ticketest
Mock Massive Event Management System designed with a microservice architecture for scalability, with an emphasis in a full testing suit.  

## Integrantes
- Eduardo Arevalo 
- Cedric Kirmayr

## Módulos principales

- `database/`: Contiene la configuración de Docker Compose para PostgreSQL, scripts de inicialización (`db/init.sql`), y la configuración de Prisma (`schema.prisma`, `.env`). Aquí se levantan la base de datos y se aplican seeds/migrations.
- `src/`: Código de la aplicación NestJS (controladores, módulos y servicios). Punto de entrada en `main.ts`.
- `prisma/` (dentro de `database/`): Esquema Prisma y modelos usados para migraciones y generación del cliente.
- `test/`: Pruebas end-to-end y configuración para ejecutar los tests del proyecto.
- `db/` (dentro de `database/`): Scripts SQL de inicialización y seed usados por el contenedor PostgreSQL.

## Quick overview & cómo usar

1. Levanta la base de datos:

```bash
cd database
docker-compose up -d
```

2. Desde la raíz, instala dependencias y genera Prisma client:

```bash
npm install
npx prisma generate
```

3. Crea/aplica migraciones en desarrollo:

```bash
npx prisma migrate dev --name init
```

4. Ejecuta la app en modo desarrollo y corre tests:

```bash
npm run start:dev
npm run test
npm run test:e2e
```

Resumen: levanta Docker en `database/`, luego desde la raíz instala dependencias, genera Prisma, aplica migraciones y corre tests. Esto te deja listo para desarrollar y validar la app.

## Tech Stack

- **Ticket Management (Gestión de Entradas)**: Go (Golang)
- **Assistant Management (Gestión de Asistentes)**: NestJS (Node.js/TypeScript)
- **Notifications (Notificaciones)**: FastAPI (Python)
- **Database Module (Gestión DB)**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL
- **Frontend**: None (No frontend)

## Functional Requirements (FR)

### Gestión de Entradas
- Consult availability of ticket types (Read from DB Module).
- Register ticket purchase.
- Verify availability before purchase.
- Reduce available quantity and increase sold quantity upon confirmation.
- Admin: Update ticket info (price, total quantity).

### Gestión de Asistentes (Attendees)
- **FR-AST-001**: Register new attendee (Create in DB Module).
- **FR-AST-002**: Confirm attendee assistance (Update in DB Module).
- **FR-AST-003**: Cancel attendee registration (Update/Delete in DB Module).
- **FR-AST-004**: Admin: Consult list of attendees per event (Read from DB Module).

### Notificaciones
- **FR-NOT-001**: Send notifications to one or more recipients (Email/SMS).
- **FR-NOT-002**: Get recipient data (email, phone) from DB Module.
- **FR-NOT-003**: Register sent notification in history (Create in DB Module).
- **FR-NOT-004**: Admin: Consult notification history (Read from DB Module).

## Overall Endpoints

### For Notification Service
- `GET /attendees/{id}`: Retrieve attendee details (email, phone). ID is UUID.
- `POST /notifications`: Create a notification history record.
- `GET /notifications`: Retrieve notification history.

### For Ticket Service
- `GET /events/{id}`: Get event/ticket availability.
- `PUT /events/{id}`: Update ticket quantity/sold count.

### For Assistant Service (Attendee Service)
- `POST /attendee-events`: Create a new attendee and link to event.
- `PATCH /attendee-events/{id}`: Update attendee details.
- `GET /attendee-events`: List all attendees.
- `GET /attendee-events/{id}`: Get attendee details.
- `DELETE /attendee-events/{id}`: Remove attendee.
- `POST /attendee-events/confirm`: Confirm attendee for an event.
- `GET /attendee-events/events/{id}`: List all attendees for a specific event.

## Use Cases (UC)

- Consultar Disponibilidad de Entradas
- Registrar Compra de Entrada
- Manipulación de entradas
- Registrar Nuevo Asistente
- Confirmar Asistencia
- Muestra Asistentes totales
- Enviar Notificación
- Consultar Historial de Notificaciones

## Test Suite

### Módulo de Gestión de Entradas (TKT)
- **TKT-INT-01**: Consult existing ticket → Call DB (GET /events/{id}) → Return quantity.
- **TKT-INT-02**: Consult non-existing ticket → Handle 404 from DB → Return "Not found".
- **TKT-INT-03**: Buy 2 tickets (Happy Path) → Verify availability → Update DB (PUT /events/{id}).
- **TKT-INT-04**: Buy tickets (Insufficient Stock) → Verify availability → Return "Insufficient stock".
- **TKT-INT-05**: Update price → Call DB (PUT /events/{id}).
- **TKT-INT-06**: Increase total quantity → Call DB (PUT /events/{id}).

### Módulo de Gestión de Asistentes (AST)
- **AST-INT-01**: Register assistant (Happy Path) → Call DB (POST /attendee-events) → Status "no confirmado".
- **AST-INT-02**: Register duplicate assistant → Handle 409 from DB → Return error.
- **AST-INT-03**: Confirm assistance → Call DB (POST /attendee-events/confirm) → Status "confirmado".
- **AST-INT-04**: Confirm non-existing assistant → Handle 404 from DB.
- **AST-INT-05**: List assistants → Call DB (GET /attendee-events).
- **AST-INT-06**: List assistants by event → Call DB (GET /attendee-events/events/{id}).

### Módulo de Notificaciones (NOT)
- **NOT-INT-01**: Send notification (Happy Path) → Get email (GET /attendees/{id}) → Simulate send → Register history (POST /notifications).
- **NOT-INT-02**: Send to non-existing assistant → Handle 404 from DB → Return "Recipient not found".
- **NOT-INT-03**: Consult history → Call DB (GET /notifications).

### Módulo de Base de Datos (DB)
- **DB-INT-01**: Create attendee → POST /attendees → Return created attendee with UUID.
- **DB-INT-02**: Create duplicate attendee → POST /attendees with existing email → Handle unique constraint error.
- **DB-INT-03**: Create attendee-event association → POST /attendee-events → Link attendee to event.
- **DB-INT-04**: Confirm attendee-event → POST /attendee-events/confirm/{id} → Update confirmed status.
- **DB-INT-05**: Get attendees by event → GET /attendee-events/events/{id} → Return list of attendees.
- **DB-INT-06**: Create notification → POST /notifications → Log notification in database.
- **DB-INT-07**: Get notification history → GET /notifications → Return all notifications.
- **DB-INT-08**: Create event type → POST /event-types → Return created event type.
- **DB-INT-09**: Create event → POST /events → Return created event with type association.

### Smoke Tests (Connectivity)
- **HUMO-01 (TKT → DB)**: GET /events/availability → 200 OK.
- **HUMO-02 (AST → DB)**: GET /attendee-events → 200 OK.
- **HUMO-03 (NOT → DB)**: GET /notifications/history → 200 OK.
- **HUMO-04 (AST → NOT)**: POST /attendee-events → 201 Created → Check NOT logs for send request.
