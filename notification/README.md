# notification

### install dependencies


install all deps (if working on just fastapi)
```
uv sync
```

dev deps if working on something not needed in prod.
```
uv sync --group dev
```

add a dev dep
```
uv add [dep] --group dev

prod deps
```
uv sync --group default
```


### run

```
uv run uvicorn app.main:app --reload --port 33205
```