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

C4 - NIVEL 1

![C4-2](./docs/C4-TICKETEST-C4%20-%20Contexto.png)

C4 - NIVEL 2
![C4-1](./docs/C4-TICKETEST-C4%20-%20Contenedores.png)




## Stack Tecnológico

- **Gestión de Entradas (Ticket Management)**: Go (Golang)
- **Gestión de Asistentes (Assistant Management)**: NestJS (Node.js/TypeScript)
- **Notificaciones (Notifications)**: FastAPI (Python)
- **Módulo de Base de Datos (Database Module)**: NestJS (Node.js/TypeScript)
- **Base de Datos**: PostgreSQL
- **Frontend**: Ninguno (No frontend)

## Requerimientos Funcionales (RF)

### Gestión de Entradas
- Consultar disponibilidad de tipos de entradas (Leer del Módulo DB).
- Registrar compra de entrada.
- Verificar disponibilidad antes de la compra.
- Reducir cantidad disponible e incrementar cantidad vendida tras confirmación.
- Admin: Actualizar información de entradas (precio, cantidad total).

### Gestión de Asistentes
- **FR-AST-001**: Registrar nuevo asistente (Crear en Módulo DB).
- **FR-AST-002**: Confirmar asistencia de asistente (Actualizar en Módulo DB).
- **FR-AST-003**: Cancelar registro de asistente (Actualizar/Eliminar en Módulo DB).
- **FR-AST-004**: Admin: Consultar lista de asistentes por evento (Leer del Módulo DB).

### Notificaciones
- **FR-NOT-001**: Enviar notificaciones a uno o más destinatarios (Email/SMS).
- **FR-NOT-002**: Obtener datos del destinatario (email, teléfono) del Módulo DB.
- **FR-NOT-003**: Registrar notificación enviada en el historial (Crear en Módulo DB).
- **FR-NOT-004**: Admin: Consultar historial de notificaciones (Leer del Módulo DB).

## Endpoints Generales

### Para Servicio de Notificaciones
- `GET /attendees/{id}`: Recuperar detalles del asistente (email, teléfono). ID es UUID.
- `POST /notifications`: Crear un registro de historial de notificación.
- `GET /notifications`: Recuperar historial de notificaciones.

### Para Servicio de Tickets
- `GET /events/{id}`: Obtener disponibilidad de evento/entrada.
- `PUT /events/{id}`: Actualizar cantidad de entradas/conteo de vendidos.

### Para Servicio de Asistentes (Attendee Service)
- `POST /attendee-events`: Crear un nuevo asistente y vincular a evento.
- `PATCH /attendee-events/{id}`: Actualizar detalles del asistente.
- `GET /attendee-events`: Listar todos los asistentes.
- `GET /attendee-events/{id}`: Obtener detalles del asistente.
- `DELETE /attendee-events/{id}`: Eliminar asistente.
- `POST /attendee-events/confirm`: Confirmar asistente para un evento.
- `GET /attendee-events/events/{id}`: Listar todos los asistentes para un evento específico.

## Casos de Uso (CU)

- Consultar Disponibilidad de Entradas
- Registrar Compra de Entrada
- Manipulación de entradas
- Registrar Nuevo Asistente
- Confirmar Asistencia
- Muestra Asistentes totales
- Enviar Notificación
- Consultar Historial de Notificaciones

## Suite de Pruebas

### Módulo de Gestión de Entradas (TKT)
- **TKT-INT-01**: Consultar entrada existente → Llamar DB (GET /events/{id}) → Retornar cantidad.
- **TKT-INT-02**: Consultar entrada no existente → Manejar 404 de DB → Retornar "No encontrado".
- **TKT-INT-03**: Comprar 2 entradas (Happy Path) → Verificar disponibilidad → Actualizar DB (PUT /events/{id}).
- **TKT-INT-04**: Comprar entradas (Stock Insuficiente) → Verificar disponibilidad → Retornar "Stock insuficiente".
- **TKT-INT-05**: Actualizar precio → Llamar DB (PUT /events/{id}).
- **TKT-INT-06**: Incrementar cantidad total → Llamar DB (PUT /events/{id}).

### Módulo de Gestión de Asistentes (AST)
- **AST-INT-01**: Registrar asistente (Happy Path) → Llamar DB (POST /attendee-events) → Estado "no confirmado".
- **AST-INT-02**: Registrar asistente duplicado → Manejar 409 de DB → Retornar error.
- **AST-INT-03**: Confirmar asistencia → Llamar DB (POST /attendee-events/confirm) → Estado "confirmado".
- **AST-INT-04**: Confirmar asistente no existente → Manejar 404 de DB.
- **AST-INT-05**: Listar asistentes → Llamar DB (GET /attendee-events).
- **AST-INT-06**: Listar asistentes por evento → Llamar DB (GET /attendee-events/events/{id}).

### Módulo de Notificaciones (NOT)
- **NOT-INT-01**: Enviar notificación (Happy Path) → Obtener email (GET /attendees/{id}) → Simular envío → Registrar historial (POST /notifications).
- **NOT-INT-02**: Enviar a asistente no existente → Manejar 404 de DB → Retornar "Destinatario no encontrado".
- **NOT-INT-03**: Consultar historial → Llamar DB (GET /notifications).

### Módulo de Base de Datos (DB)
- **DB-INT-01**: Crear asistente → POST /attendees → Retornar asistente creado con UUID.
- **DB-INT-02**: Crear asistente duplicado → POST /attendees con email existente → Manejar error de restricción única.
- **DB-INT-03**: Crear asociación asistente-evento → POST /attendee-events → Vincular asistente a evento.
- **DB-INT-04**: Confirmar asistente-evento → POST /attendee-events/confirm/{id} → Actualizar estado confirmado.
- **DB-INT-05**: Obtener asistentes por evento → GET /attendee-events/events/{id} → Retornar lista de asistentes.
- **DB-INT-06**: Crear notificación → POST /notifications → Registrar notificación en base de datos.
- **DB-INT-07**: Obtener historial de notificaciones → GET /notifications → Retornar todas las notificaciones.
- **DB-INT-08**: Crear tipo de evento → POST /event-types → Retornar tipo de evento creado.
- **DB-INT-09**: Crear evento → POST /events → Retornar evento creado con asociación de tipo.

### Smoke Tests (Conectividad)
- **HUMO-01 (TKT → DB)**: GET /events/availability → 200 OK.
- **HUMO-02 (AST → DB)**: GET /attendee-events → 200 OK.
- **HUMO-03 (NOT → DB)**: GET /notifications/history → 200 OK.
- **HUMO-04 (AST → NOT)**: POST /attendee-events → 201 Created → Verificar logs de NOT para solicitud de envío.
