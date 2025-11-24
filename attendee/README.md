# Attendee Module

## Testing

**Unit Tests:**
```bash
npm run test
```

**Integration Tests:**
```bash
npm run test:e2e -- integration.e2e-spec.ts
```

**Smoke Tests:**
```bash
npm run test:e2e -- smoke.e2e-spec.ts
```

> **Note:** Integration and smoke tests require the Database Module to be running.

## Running the Service

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run start:prod
```

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file with:
```
DB_SERVICE_URL=http://localhost:11000
```

## Endpoints

- `POST /attendee-events` - Create attendee-event association
- `GET /attendee-events` - List all attendee-events
- `GET /attendee-events/:id` - Get specific attendee-event
- `PATCH /attendee-events/:id` - Update attendee-event
- `DELETE /attendee-events/:id` - Delete attendee-event
- `POST /attendee-events/confirm` - Confirm attendee for event
- `GET /attendee-events/events/:id` - List attendees by event
