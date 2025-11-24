Ticketest — Módulo de Ticket (Ejecución)

Este repositorio contiene el módulo de `ticket` implementado en Go. Este documento explica cómo compilar, ejecutar y probar la aplicación localmente y con Docker.

**Requisitos:**
- **Go:** versión >= la indicada en `go.mod` (actualmente `go 1.25.4`).
- **Docker** (opcional, para ejecutar en contenedor).
- **docker-compose** (opcional, para desplegar servicios definidos en `docker-compose.yaml`).

**Rutas relevantes:**
- Código principal: `./cmd` (contiene `main.go`).
- Dockerfile para producción: `./build/Dockerfile`.
- Compose: `docker-compose.yaml`.

## Preparación

1. Clona el repositorio y sitúate en la carpeta del proyecto:

```bash
git clone https://github.com/cucharoth/ticketest.git
cd ticketest/ticket
```

2. Verifica la versión de Go instalada:

```bash
go version
```

Si la versión no cumple con la requerida, instala o actualiza Go según tu sistema.

3. (Opcional) Copia un archivo de variables de entorno si el proyecto lo necesita:

```bash
cp .env.example .env   # si existe .env.example
# editar .env según sea necesario
```

## Compilar y ejecutar localmente

- Ejecutar directamente con `go run` (modo desarrollo):

```bash
go run ./cmd
```

- Compilar un binario y ejecutarlo:

```bash
go build -o bin/ticket ./cmd
./bin/ticket
```

Nota: `./cmd` contiene el entrypoint `main.go`. Ajusta la salida (`-o`) según prefieras.

## Comandos útiles

- Ejecutar tests:

```bash
go test ./...
```

- Ejecutar tests con cobertura:

```bash
go test ./... -cover
```

- Formatear código y revisar vet:

```bash
gofmt -w .
go vet ./...
```


## Ejecución con Docker

Construir la imagen Docker (usa el Dockerfile en `build/`):

```bash
docker build -f build/Dockerfile -t ticketest:latest .
```

Ejecutar el contenedor:

```bash
docker run --rm -p 8080:8080 --env-file .env ticketest:latest
```

O usa `docker-compose` si quieres orquestar varios servicios:

```bash
docker-compose up --build
```

## Desarrollo y depuración

- Revisa los logs por stdout/stderr; la aplicación imprime información de arranque y errores.
- Comprueba el puerto configurado (por defecto suele ser `8080`, revisa la configuración en el código o en `.env`).

## Troubleshooting rápido

- Errores de módulos (dependencias):

```bash
go mod tidy
```

- Si cambia la versión de Go en `go.mod` y tienes inconsistencias, actualiza tu instalación de Go o ajusta `go.mod` según convenga.

- Problemas con Docker: asegúrate de que el demonio Docker está corriendo y que tienes permisos necesarios.