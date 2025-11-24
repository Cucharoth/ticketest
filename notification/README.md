# notification

### TESTING

**Unit Tests:**
```
uv run pytest tests/ -v --cov=app/services --cov-report=term-missing
```

**Integration Tests:**
```
uv run pytest tests/test_notification_integration.py -v
```

> **Note:** Integration tests require the Database Module to be running.

### ENDPOINT

`POST /api/notifications/send`
`GET /api/notifications/history`

### install dependencies

install all deps
```
uv sync
```

### run

```
uv run uvicorn app.main:app --reload --port 33205
```