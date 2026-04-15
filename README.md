# SGOA - Sistema de Gestión y Organización Académica (Versión 1)

<!-- badges -->

[![NestJS](https://img.shields.io/badge/NestJS-11.0-ea2845?style=flat&logo=nestjs)](https://nestjs.com)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17.5-336791?style=flat&logo=postgresql)](https://www.postgresql.org)

> Sistema académico integral para la gestión y organización de actividades docentes, planificaciones y reportes académicos desarrollado para la Universidad Nacional Autónoma de Honduras (UNAH) Campus Copán (CUROC).

## Descripción

SGOA es un sistema integral para la administración académica que permite gestionar docentes, cursos, salones, períodos académicos, asignaciones docentes, actividades complementarias, inventario de equipos y más. El proyecto está compuesto por tres aplicaciones principales:

- **Backend (API REST)**: NestJS + Prisma ORM + PostgreSQL
- **Frontend (Web)**: React + TypeScript + Vite + TailwindCSS
- **Planificador IA**: FastAPI + Google OR-Tools para optimización de horarios

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         SGOA Architecture                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐      ┌─────────────┐     ┌─────────────┐      │
│   │  Frontend   │────▶│   Backend   │────▶│ PostgreSQL  │      │
│   │   (React)   │      │  (NestJS)   │     │  Database   │      │
│   └─────────────┘      └──────┬──────┘     └─────────────┘      │
│                             │                                   │
│                    ┌────────┴────────┐                          │
│                    │ Planificador IA │                          │
│                    │  (FastAPI +     │                          │
│                    │   OR-Tools)     │                          │
│                    └─────────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Características

### Gestión Académica

- Registro y administración de docentes
- Períodos académicos (trimestrales y semestrales)
- Asignaciones docentes
- Gestión de salones y equipamiento
- Modalidades (presencial, virtual, semipresencial)

### Módulos del Sistema

| Módulo          | Descripción                                  |
| --------------- | -------------------------------------------- |
| Autenticación   | JWT con refresh tokens                       |
| Docentes        | Gestión completa de personal docente         |
| Coordinación    | Dashboard para coordinadores de departamento |
| Autoridades     | Panel para autoridades académicas            |
| RRHH            | Gestión de recursos humanos                  |
| Inventario      | Control de equipos y equipamiento            |
| Planificador IA | Optimización de horarios académicos          |

## Estudiantes

| Nombre | GitHub |
| ------ | ------ |
| Carlos Su | [@CarlosSu02](https://github.com/CarlosSu02) |
| Jorge Canales | [@JrgCanales](https://github.com/JrgCanales) |
| Lesvi Flores | [@Lesvi18](https://github.com/Lesvi18) |
| Paola Madrid | [@PaolaMad](https://github.com/PaolaMad) |
| Raúl Urquía | [@JRAUL19](https://github.com/JRAUL19) |
| Fredy Vasquez | [@FredyVasquez16](https://github.com/FredyVasquez16) |

> Proyecto desarrollado como parte de la clase de **Tópicos Especiales y Avanzados** - II PAC 2025

## Tecnologías

### Backend

- **Framework**: NestJS 11
- **ORM**: Prisma 7
- **Base de datos**: PostgreSQL 17.5
- **Autenticación**: JWT + Passport
- **Validación**: class-validator + Joi

### Frontend

- **Framework**: React 19 + TypeScript
- **Build**: Vite 7
- **Estilos**: TailwindCSS 4
- **UI**: Radix UI + shadcn/ui
- **Estado**: TanStack Query + Context API

### Planificador IA

- **Framework**: FastAPI
- **Optimización**: Google OR-Tools
- **Validación**: Pydantic

## Requisitos Previos

- Node.js 20+
- pnpm
- Python 3.10+
- Docker y Docker Compose
- PostgreSQL (local o contenedor)

## Inicio Rápido

### Clonar el repositorio

```bash
git clone <repository-url>
cd sgoa-projects
```

### Configurar y ejecutar cada componente

#### Backend

```bash
cd backend
cp .env.example .env
# Editar .env con tus configuraciones
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm run start:dev
```

#### Frontend

```bash
cd frontend
cp .env.template .env
# Editar .env con tus configuraciones
npm install
npm run dev
```

#### Planificador IA

```bash
cd planificador_ia
python -m venv venv
source venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
uvicorn main:app --reload
```

## Estructura del Proyecto

```
sgoa-projects/
├── backend/              # API REST con NestJS
│   ├── src/
│   │   ├── modules/     # Módulos de la aplicación
│   │   └── main.ts
│   └── package.json
│
├── frontend/            # Aplicación web con React
│   ├── src/
│   │   ├── app/       # Configuración y router
│   │   ├── components/
│   │   └── features/
│   └── package.json
│
├── planificador_ia/    # API de optimización
│   ├── main.py
│   └── requirements.txt
│
└── README.md
```

## Documentación

- [Backend](./backend/README.md)
- [Frontend](./frontend/README.md)
- [Planificador IA](./planificador_ia/README.md)

## Variables de Entorno

### Backend

| Variable       | Descripción                 |
| -------------- | --------------------------- |
| `PORT`         | Puerto del servidor         |
| `DATABASE_URL` | URL de PostgreSQL           |
| `AT_SECRET`    | Clave JWT access token      |
| `RT_SECRET`    | Clave JWT refresh token     |
| `CLOUDINARY_*` | Configuración de Cloudinary |
| `FE_URL`       | URL del frontend            |

### Frontend

| Variable       | Descripción           |
| -------------- | --------------------- |
| `VITE_API_URL` | URL de la API backend |

### Planificador IA

| Variable                            | Descripción            |
| ----------------------------------- | ---------------------- |
| Configuración en `requirements.txt` | Dependencias de Python |
