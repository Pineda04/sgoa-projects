# SGOA - Sistema de Gestión y Organización Académica

Backend REST API para la gestión y organización académica de una universidad, desarrollado con NestJS y Prisma ORM.

## Descripción

SGOA es un sistema integral para la administración académica que permite gestionar docentes, cursos, salones, períodos académicos, asignaciones docentes, actividades complementarias, inventario de equipos y más. El proyecto fue desarrollado como parte de la clase de Tópicos Especiales y Avanzados del II PAC 2025.

## Participantes

| Nombre        | Correo                          |
| ------------- | ------------------------------- |
| Carlos Su     | carlosj.sup@gmail.com           |
| Jorge Canales | jorgecanalesortega935@gmail.com |

## Tecnologías

- **Framework**: NestJS
- **ORM**: Prisma v7
- **Base de datos**: PostgreSQL
- **Autenticación**: JWT con refresh tokens
- **Validación**: class-validator + Joi

## Características

### Gestión de Docentes

- Registro y administración de docentes
- Categorías, tipos de contrato y turnos
- Grados académicos (pregrado y posgrado)
- Preferencias de clases
- Cargos académicos por departamento

### Gestión Académica

- Períodos académicos (trimestrales y semestrales)
- Fechas estimadas de períodos académicos (edición)
- Asignaciones docentes
- Sesiones de enseñanza
- Clases por salón
- Modalidades (presencial, virtual, semipresencial)
- Estadísticas de cursos

### Gestión de Infraestructura

- Edificios y salones
- Equipamiento de salones (proyectores, computadoras, aire acondicionado)
- Tipos de salón, conectividad y equipos de audio

### Inventario

- Equipos de computación
- Aires acondicionados
- Marcas y condiciones
- Tipos y tamaños de monitores

### Actividades Complementarias

- Registro de actividades
- Tipos de actividad
- Medios de verificación
- Archivos multimedia (Cloudinary)

### Módulos Adicionales

- Integración con Cloudinary
- Planificador con IA
- Sistema de correos

### API Endpoints

| Módulo                      | Endpoint principal          |
| --------------------------- | --------------------------- |
| Autenticación               | `/auth`                     |
| Usuarios                    | `/users`                    |
| Docentes                    | `/teachers`                 |
| Centros                     | `/centers`                  |
| Departamentos               | `/departments`              |
| Cursos                      | `/courses`                  |
| Salones                     | `/classrooms`               |
| Períodos Académicos         | `/academic-periods`         |
| Asignaciones                | `/academic-assignments`     |
| Actividades Complementarias | `/complementary-activities` |
| Inventario                  | `/inventory`                |
| Excel                       | `/excel`                    |

> Para documentación completa de la API, iniciar el servidor y acceder a `/api/docs`

## Requisitos Previos

- Node.js 20+
- pnpm
- Docker y Docker Compose
- PostgreSQL (local o contenedor)

## Configuración

1. Clonar el repositorio
2. Instalar dependencias:

```bash
pnpm install
```

3. Configurar variables de entorno en `.env`:

```env
# ============================================
# Servidor
# ============================================

PORT=9999                      # Puerto del servidor
HOST={{ your_host }}/v1/api    # Host de la API

# ============================================
# Base de datos
# ============================================

DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]?schema=public"
# URL de conexión a PostgreSQL (formato: postgresql://user:password@host:puerto/db?schema=)

# ============================================
# PostgreSQL (Docker)
# ============================================

POSTGRES_USER=your_user       # Usuario de PostgreSQL
POSTGRES_PASSWORD=your_password  # Contraseña del usuario
POSTGRES_DB=db              # Nombre de la base de datos

# ============================================
# pgAdmin (Docker)
# ============================================

PGADMIN_DEFAULT_EMAIL=your_email     # Correo para iniciar sesión en pgAdmin
PGADMIN_DEFAULT_PASSWORD=your_password  # Contraseña de pgAdmin

# ============================================
# JWT (Autenticación)
# ============================================

AT_SECRET=value  # Clave secreta para tokens de acceso
RT_SECRET=value # Clave secreta para tokens de actualización

# ============================================
# Cloudinary (Almacenamiento de imágenes)
# ============================================

CLOUDINARY_CLOUD_NAME=your_cloud_name  # Nombre de la nube en Cloudinary
CLOUDINARY_API_KEY=your_api_key        # API Key de Cloudinary
CLOUDINARY_API_SECRET=your_api_secret # API Secret de Cloudinary

# ============================================
# Frontend
# ============================================

FE_URL=url  # URL del frontend para CORS y cookies

# ============================================
# Cookie Parser
# ============================================

COOKIE_KEY=your_cookie_secret_key  # Clave para firmar las cookies

# ============================================
# Correo (Nodemailer)
# ============================================

EMAIL=your_email         # Correo remitente
EMAIL_KEY=your_email_key   # Clave de aplicación de Google
SMTP_HOST=email_host    # Servidor SMTP
SMTP_PORT=email_port  # Puerto SMTP

# ============================================
# Planificador IA
# ============================================

PLANIFICATOR_AI_HOST=url  # Host del servicio de IA
```

4. Generar el cliente de Prisma:

```bash
pnpm prisma generate
```

5. Ejecutar migraciones y seed (datos iniciales):

```bash
# Ejecutar migraciones
pnpm prisma migrate dev

# Poblar la base de datos con datos iniciales (roles, usuarios, categorías, etc.)
pnpm prisma db seed
```

> El seed incluye: roles, usuarios, categorías de docentes, tipos de contrato, turnos, cargos, centros, facultades, departamentos, cursos, modalidades, edificios, salones, marcas, condiciones, equipos, tipos de actividades, y más.

> Para obtener el query con información adicional para el seed, contactar al coordinador de área o quien corresponda.

## Ejecución

### Desarrollo

```bash
pnpm run start:dev
```

### Producción con Docker

```bash
docker compose up -d
```

Esto inició:

- PostgreSQL en el puerto 5432
- pgAdmin en el puerto 5433
- Backend API
- Nginx con SSL en el puerto 3000

### Generar certificados SSL (desarrollo)

```bash
# Ejemplo => cambiar según la región
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout compose/nginx/certs/privkey.pem \
  -out compose/nginx/certs/fullchain.pem \
  -subj "/C=HN/ST=Tegucigalpa/L=Tegucigalpa/O=Local Development/CN=localhost"
```

## Estructura del Proyecto

```
src/
├── modules/
│   ├── auth/                   # Autenticación
│   ├── users/                  # Gestión de usuarios
│   ├── teachers/              # Docentes
│   ├── centers/              # Centros y facultades
│   ├── course-classrooms/      # Cursos y salones
│   ├── teaching-assignment/   # Asignaciones
│   ├── complementary-activities/ # Actividades
│   ├── inventory/            # Inventario
│   ├── infraestructure/      # Infraestructura
│   └── ...
├── generated/prisma/           # Cliente Prisma generado
└── main.ts
```

## Base de Datos

El esquema incluye múltiples esquemas:

- `auth` - Usuarios y roles
- `academic` - Gestión académica
- `infraestructure` - Edificios y salones
- `inventory` - Equipos
- `ai` - Preferencias de docentes
