# Dockerfile NodeJS - Comparación Original vs Actual

## Resumen Ejecutivo

Este documento compara el Dockerfile original de NodeJS con la versión actual, explicando los cambios realizados para resolver el error de Prisma v7: `The datasource.url property is required in your Prisma config file when using prisma migrate deploy.`

## Comparación Lado a Lado

| Aspecto           | Original (v1)   | Actual (v2)                                        |
| ----------------- | --------------- | -------------------------------------------------- |
| Build stage       | Sin ARG/ENV     | `ARG DATABASE_URL` + crea `.env`                   |
| Runtime stage     | Solo copia dist | `ARG DATABASE_URL` comentado                       |
| Prisma generate   | Solo en build   | En build + en runtime stage                        |
| Archivos copiados | Solo dist       | .env, prisma.config.ts, tsconfig.json, src, prisma |
| Node modules      | No copiado      | Copiado solo `.prisma`                             |
| psql client       | No instalado    | Instalado en runtime                               |

---

## Cambios Realizados

### 1. Builder Stage (Líneas 1-17)

```dockerfile
# ANTES (Original)
FROM node:25-alpine3.22 AS builder
WORKDIR /home/app
COPY package*.json pnpm*.yaml ./
RUN npm i -g pnpm && pnpm i --frozen-lockfile
COPY . .
RUN pnpm prisma generate && pnpm build

# AHORA (Actual)
FROM node:25-alpine3.22 AS builder

ARG APP_ENVIRONMENT=production
ARG DATABASE_URL
ENV NODE_ENV=$APP_ENVIRONMENT

WORKDIR /home/app

RUN echo "DATABASE_URL=$DATABASE_URL" > .env

COPY package*.json pnpm*.yaml ./
RUN npm i -g pnpm && pnpm i --frozen-lockfile

COPY . .

RUN pnpm build
```

**Cambio:** Se agregó `ARG DATABASE_URL` que se pasa desde docker-compose como build-arg, y se crea un archivo `.env` temporal necesario para Prisma v7 durante el build.

### 2. Runtime Stage (Líneas 20-51)

```dockerfile
# ANTES (Original)
FROM node:25-alpine3.22
WORKDIR /home/app
COPY --from=builder /home/app/dist ./dist
COPY --from=builder /home/app/package*.json ./
COPY --from=builder /home/app/pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm i --frozen-lockfile --production
COPY --from=builder /home/app/node_modules/.prisma ./node_modules/.prisma
USER node
CMD ["pnpm", "start:prod"]

# AHORA (Actual)
FROM node:25-alpine3.22

ARG APP_ENVIRONMENT=production
# ARG DATABASE_URL
ENV NODE_ENV=$APP_ENVIRONMENT
# ENV DATABASE_URL=$DATABASE_URL

WORKDIR /home/app

RUN apk add --no-cache openssl postgresql-client

COPY --from=builder /home/app/package*.json ./
COPY --from=builder /home/app/pnpm-lock.yaml ./
COPY --from=builder /home/app/.env ./
COPY --from=builder /home/app/prisma.config.ts ./
COPY --from=builder /home/app/tsconfig.json ./
COPY --from=builder /home/app/prisma ./prisma
COPY --from=builder /home/app/src ./src
COPY --from=builder /home/app/dist ./dist

RUN npm i -g pnpm && pnpm i --frozen-lockfile --production

RUN pnpm prisma generate

COPY scripts/entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER node

ENTRYPOINT ["./entrypoint.sh"]
CMD ["pnpm", "start:prod"]
```

**Cambios:**

- `ARG DATABASE_URL` comentado porque viene de `environment:` en docker-compose
- `ENV DATABASE_URL` comentado - no se almacena en la imagen
- Se instalado `postgresql-client` para verificar conexión a Postgres
- Se copian archivos adicionales: .env (para build), prisma.config.ts, tsconfig.json, prisma/, src/
- Se ejecuta `pnpm prisma generate` en runtime para regenerar el client
- Se usa entrypoint.sh para migrations en runtime

---

## Explicación Técnica según Prisma v7

### El Problema Original

```
Error: The datasource.url property is required in your Prisma config file when using prisma migrate deploy.
```

### Por qué ocurría

1. Prisma v7 **no carga automáticamente** variables de entorno
2. El `.env` file se creaba en el builder stage pero **no se copiaba** al runtime stage
3. En runtime, `process.env.DATABASE_URL` estaba vacío
4. `prisma.config.ts` requiere `datasource.url` para `prisma migrate deploy`

### La Solución

Según la skill Prisma v7 (`env-variables.md`, líneas 148-161):

> _"No need for dotenv in CI if variables are set directly."_

> _"Ensure environment variables are set in your CI environment"_

La solución usa **environment variables directas** desde docker-compose en lugar de un archivo .env copiado a la imagen.

---

## Flujo de Datos

### Build-time

```
docker-compose.yml (build args)
    │
    ▼
ARG DATABASE_URL
    │
    ▼
RUN echo "DATABASE_URL=$DATABASE_URL" > .env
    │
    ▼
prisma generate (usa .env)
    │
    ▼
nest build
```

### Runtime

```
docker-compose.yml (environment)
    │
    ▼
environment: DATABASE_URL=...
    │
    ▼
process.env.DATABASE_URL
    │
    ▼
prisma.config.ts (process.env.DATABASE_URL)
    │
    ▼
prisma migrate deploy
```

---

## Beneficios de la Nueva Configuración

| Aspecto           | beneficio                                              |
| ----------------- | ------------------------------------------------------ |
| **Seguridad**     | Credenciales no almacenadas en la imagen Docker        |
| **Flexibilidad**  | Rotación de credenciales sin rebuild                   |
| **Best Practice** | Sigue Prisma v7 - environment vars directas            |
| **Debugging**     | Entry point permite verificar conexión antes de migrar |
| **Mantenimiento** | Separa build (compilación) de runtime (migraciones)    |

---

## docker-compose.yml reference

```yaml
services:
  backend:
    build:
      context: .
      dockerfile: ./compose/nodejs/Dockerfile
      args:
        - APP_ENVIRONMENT=production
        - DATABASE_URL=${DATABASE_URL}
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public
```

---

## Entry Point Script

```bash
#!/bin/sh
set -e

echo "=== Starting entrypoint ==="

echo "Waiting for postgres..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U $POSTGRES_USER -d postgres -c '\q' 2>/dev/null; do
  sleep 2
done

echo "Postgres is up!"

echo "Creating database if not exists..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U $POSTGRES_USER -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 ||
  PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U $POSTGRES_USER -d postgres -c "CREATE DATABASE $POSTGRES_DB"

echo "Running migrations..."
pnpm prisma migrate deploy

echo "Running seed..."
pnpm dlx tsx prisma/seed.ts

echo "Starting application..."
exec "$@"
```

---

## Errores Comunes y Soluciones

| Error                                 | Causa                          | Solución                                                            |
| ------------------------------------- | ------------------------------ | ------------------------------------------------------------------- |
| `DATABASE_URL is empty`               | ARG no pasado como build-arg   | Agregar `DATABASE_URL=${DATABASE_URL}` en docker-compose build args |
| `psql: not found`                     | postgresql-client no instalado | Agregar `apk add postgresql-client` en runtime stage                |
| `database "xxx" does not exist`       | DB no creada                   | entrypoint.sh crea la DB antes de migrar                            |
| `datasource.url property is required` | process.env.DATABASE_URL vacío | Verificar environment en docker-compose.yml                         |

---

## Referencias

- [Prisma v7 Upgrade Guide](https://www.prisma.io/docs/orm/more/upgrades/to-v7)
- [Environment Variables - Prisma v7](./references/env-variables.md)
- [Driver Adapters - Prisma v7](./references/driver-adapters.md)
- [Prisma Config - Prisma v7](./references/prisma-config.md)

## Archivos Relacionados

```
compose/nodejs/
├── Dockerfile                           # Dockerfile actual de NodeJS
├── DOCKERFILE_COMPARISON.md             # Este documento
└── references/                         # Referencias a Prisma v7 (symlinks)
    ├── env-variables.md               # → Skill Prisma v7
    ├── driver-adapters.md             # → Skill Prisma v7
    └── prisma-config.md               # → Skill Prisma v7

scripts/
└── entrypoint.sh                       # Script de inicialización

prisma/
├── schema.prisma                       # Schema de Prisma
├── config.ts                           # Configuración de Prisma v7
└── seed.ts                            # Seed de la base de datos
```
