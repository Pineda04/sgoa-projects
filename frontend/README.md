# SGOA - Sistema de Gestión y Organización Académica

<!-- badges -->

[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-UNAH-FF6B00?style=flat)](#)

> Sistema académico para la gestión y organización de actividades docentes, planificaciones y reportes académicos.

## Descripción

SGOA es una aplicación web desarrollada para la Universidad Nacional Autónoma de Honduras (UNAH) que permite gestionar y organizar las actividades académicas de manera eficiente. El sistema proporciona herramientas para coordinadores, profesores, autoridades académicas y personal administrativo.

## Características

- **Gestión de Clases**: Creación y edición de clases por departamento
- **Planificaciones**: Gestión de planificaciones académicas con carga de archivos
- **Reportes Académicos**: Generación de reportes de asignación académica
- **Gestión de Usuarios**: Control de acceso basado en roles (coordinador, profesor, autoridad, RRHH)
- **Exportación PDF**: Generación de reportes en PDF

## Tecnologías

- **Frontend**: React 19 + TypeScript + Vite
- **Estilos**: TailwindCSS v4
- **UI Components**: Radix UI + shadcn/ui patterns
- **Estado**: React Query (TanStack Query) + Context API
- **Formularios**: Formik + Zod
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios

## Participantes

- Carlos Su ([carlosj.sup@gmail.com](mailto:carlosj.sup@gmail.com))
- Jorge Canales ([jorgecanalesortega935@gmail.com](mailto:jorgecanalesortega935@gmail.com))
- Lesvi Flores ([floresyadira585@gmail.com](mailto:floresyadira585@gmail.com))
- Paola Madrid ([paolamadridt@gmail.com](mailto:paolamadridt@gmail.com))
- Raúl Urquía

> Proyecto desarrollado como parte de la clase de Tópicos Especiales y Avanzados del II PAC 2025.

## Estructura del Proyecto

```
src/
├── app/                  # Configuración de la app y router
├── components/           # Componentes compartidos UI
│   ├── ui/              # Componentes primitivos
│   ├── form/            # Componentes de formulario
│   └── navigation/       # Componentes de navegación
├── features/            # Módulos por funcionalidad
│   ├── auth/            # Autenticación
│   ├── coordinators/   # Módulo de coordinadores
│   ├── teachers/       # Módulo de profesores
│   ├── authorities/    # Módulo de autoridades
│   ├── rrhh/           # Módulo de recursos humanos
│   ├── shared/         # Componentes compartidos
│   └── ...
├── providers/          # Context providers
├── lib/                 # Utilerías
└── types/               # Tipos globales
```

## Requisitos Previos

- Node.js 20+
- npm 10+

## Instalación

1. Clonar el repositorio:

```bash
git clone <repository-url>
```

2. Instalar dependencias:

```bash
npm install
```

3. Configurar variables de entorno:

```bash
cp .env.template .env
```

Editar el archivo `.env` con las configuraciones requeridas.

## Ejecución

### Desarrollo

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### Producción

1. Construir la aplicación:

```bash
npm run build
```

2. Previsualizar el build:

```bash
npm run preview
```

### Linting

Ejecutar el linter:

```bash
npm run lint
```

## Rutas Principales

| Ruta             | Descripción                           |
| ---------------- | ------------------------------------- |
| `/auth/*`        | Autenticación (login, reset-password) |
| `/home`          | Página principal                      |
| `/docentes`      | Dashboard de profesor                 |
| `/coordinadores` | Dashboard de coordinador              |
| `/autoridades`   | Dashboard de autoridades              |
| `/rrhh`          | Dashboard de RRHH                     |
| `/usuarios`      | Gestión de usuarios                   |
| `/clases`        | Gestión de cursos                     |

## Configuración

### Variables de Entorno

| Variable        | Descripción             |
| --------------- | ----------------------- |
| `VITE_API_URL`  | URL de la API backend   |
| `VITE_APP_NAME` | Nombre de la aplicación |

## Ejemplos de Posibles Integraciones

El backend cuenta con endpoints que soportan los siguientes ejemplos de integraciones futuras:

- **Planificador IA**: Integración con PlanificatorAi para asistencia en planificaciones académicas
- **Gestión de Espacios Físicos**: Gestión de edificios, aulas y equipos (Building, Classroom, RoomType)
- **Equipamiento**: Control de equipos de cómputo, aire acondicionado, equipos de audio (PcEquipments, AudioEquipment, AirConditioners)
- **Postgrados**: Gestión de programas de posgrado y inscripciones (Postgrads, TeachersPostgrad)
- **Categorías de Profesores**: Sistema de categorías y posiciones académicas (TeacherCategories, Positions)

<!-- appendix -->
