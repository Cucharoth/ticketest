# Notification Module

## Testing

**Unit Tests:**
```bash
uv run pytest tests/ -v --cov=app/services --cov-report=term-missing
```

**Integration Tests:**
```bash
uv run pytest tests/test_notification_integration.py -v
```

**Smoke Tests:**
```bash
uv run pytest tests/test_smoke.py -v
```

> **Note:** Integration and smoke tests require the Database Module to be running.

## Running the Service

**Development mode:**
```bash
uv run uvicorn app.main:app --reload --port 33205
```

**Production mode:**
```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port 33205
```

## Installation

Install all dependencies:
```bash
uv sync
```

## Environment Variables

Create a `.env` file with:
```
DB_SERVICE_URL=http://localhost:3000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@example.com
```

## Endpoints

- `POST /api/notifications/send` - Send notification to attendee
- `GET /api/notifications/history` - Get notification history