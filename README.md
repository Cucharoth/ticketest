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
