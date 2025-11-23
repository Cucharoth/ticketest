# notification

### TESTING

```
uv run pytest tests/ -v --cov=app/services --cov-report=term-missing
```

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