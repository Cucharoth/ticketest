<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

**Resumen**

Instrucciones rápidas para levantar la base de datos, ejecutar migraciones/seed y correr los tests del proyecto.

**Requisitos**

- **Docker / Docker Compose**: necesario para el servicio PostgreSQL definido en `database/docker-compose.yaml`.
- **Node.js & npm**: para ejecutar comandos de Prisma y tests (`node >= 16` recomendado).

**Variables de entorno**

- Revisa `database/.env`. La conexión esperada por defecto es:

  - `DATABASE_URL="postgresql://postgres:postgres@localhost:11000/ticket_test_db"`

**Arrancar la base de datos (Docker)**

- Desde la carpeta `database` levanta el contenedor PostgreSQL:

```bash
cd database
docker-compose up -d
```

- Notas sobre el seed (`db/init.sql`):
  - El script `database/db/init.sql` se monta en `/docker-entrypoint-initdb.d/` y se ejecuta solo la primera vez que se inicializa el volumen de datos.
  - Si necesitas re-ejecutar el `init.sql`, elimina el volumen y vuelve a levantar el servicio:

```bash
docker-compose down -v
docker-compose up -d
```

**Instalar dependencias y generar cliente Prisma**

- Desde la raíz del proyecto:

```bash
npm install
npx prisma generate
```

**Migraciones (desarrollo / CI)**

- Desarrollo (crea la migración y la aplica):

```bash
npx prisma migrate dev --name init
```

- Deploy en CI / producción (aplica migraciones ya generadas):

```bash
npx prisma migrate deploy
```

**Seed / Inicialización de datos**

- Si dependes de `database/db/init.sql` el seed ya se aplica al crear el volumen (ver sección Docker arriba).
- Si prefieres usar `prisma db seed`, configura `package.json`/`prisma` y ejecuta:

```bash
npx prisma db seed
```

(Actualmente este repo incluye `database/db/init.sql` como mecanismo de seed en Docker.)

**Ejecutar la aplicación y tests**

- Ejecutar en desarrollo:

```bash
npm run start:dev
```

- Tests unitarios:

```bash
npm run test
```

- Tests e2e:

```bash
npm run test:e2e
```

**Comandos rápidos (resumen)**

- Levantar DB: `cd database && docker-compose up -d`
- Forzar seed de `init.sql`: `docker-compose down -v && docker-compose up -d`
- Generar cliente Prisma: `npx prisma generate`
- Migraciones dev: `npx prisma migrate dev --name init`
- Aplicar migraciones (prod): `npx prisma migrate deploy`
- Ejecutar tests: `npm run test` / `npm run test:e2e`

**Resolución de problemas**

- Si Prisma no conecta: comprueba `DATABASE_URL` en `database/.env` y que el contenedor esté sano (`docker ps` / `docker logs db.local`).
- El `init.sql` solo se ejecuta en una base de datos vacía; borra el volumen si necesitas re-ejecutarlo.

**¿Siguiente?**

- ¿Quieres que añada un script `npm` para levantar la DB desde la raíz o que genere un `Makefile` con los comandos más usados? 

Archivo generado automáticamente por el asistente.
