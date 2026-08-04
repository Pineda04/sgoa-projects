# Plan de implementación — Analíticas académicas SGOA

**Estado:** En ejecución incremental; fases 2, 3, 4 y 5 completadas
**Fecha:** 3 de agosto de 2026
**Fuentes:** `spec.md`, `research.md`, `proposal.md` y decisiones del brainstorming
**Principio rector:** aplicar el cambio mínimo que cumpla el requerimiento de negocio y preserve resultados auditables.

## 1. Resultado acordado

Crear una ruta transversal `/analytics` con vistas autorizadas para ADMIN, DIRECCION, RRHH, COORDINADOR_AREA, DOCENTE y MONITOR. La solución consolidará datos operacionales existentes sin introducir un data warehouse, un generador de consultas, una clase Strategy por indicador ni un rediseño general de los CRUD.

La entrega se hará por incrementos verticales. Cada incremento debe incluir consulta backend, autorización por filas, contrato de calidad, UI, desglose, exportación cuando corresponda y pruebas antes de comenzar el siguiente dominio.

## 2. Decisiones cerradas

| Tema | Decisión |
|---|---|
| Alcance del plan | Programa completo por fases, no una única entrega masiva. |
| Reglas pendientes | Proponer defaults explícitos y validarlos antes de publicar la métrica afectada. |
| Arquitectura backend | `AnalyticsModule` con servicios y endpoints explícitos por dominio. No Strategy por métrica. |
| Consultas | Prisma tipado primero. Usar SQL parametrizado solo cuando una consulta medida no sea viable o eficiente con Prisma. |
| Frontend | Una ruta `/analytics`, compuesta por capacidades; no duplicar una página por rol. |
| UV | Cada sección única suma las UV completas de su curso. |
| Tiempo | Filtrar por período/PAC, modalidad y año. No exponer “semestre” sin equivalencia institucional. |
| Comparaciones | El usuario elige período actual y período de comparación. |
| Calidad comparada | Cada comparación conserva estado y cobertura tanto del período consultado como del período base; una cobertura parcial no se oculta ni invalida el delta. |
| Filtros multirol | Las opciones y defaults de centro/docente se resuelven por dominio. Los controles compartidos nunca amplían el scope de otro dominio. |
| Promedio de carga | Docentes con al menos una asignación dentro del alcance. |
| Promedio de actividades | Docentes con un informe existente para el período y alcance; mostrar cobertura respecto de docentes activos. |
| Sobrecarga | Mostrar diferencia frente al promedio, pero no etiquetar “sobrecarga”. |
| Horarios | Conservar `CourseClassroom.days` y `section`: todos los días de una sección comparten el mismo rango. |
| Duración de clase | La duración es variable; inicio y fin se capturan explícitamente y no se infiere un bloque fijo. |
| Aulas | Implementar disponibilidad para período, día y rango. No calcular utilización institucional por horas-aula. |
| Universo de aulas | ADMIN/DIRECCION ven aulas físicas activas; DOCENTE, las usadas por sus asignaciones del período; COORDINADOR_AREA, las del centro vinculadas a sus departamentos vigentes. Excluir espacios virtuales. |
| Ocupación de aulas | El scope limita las aulas visibles, pero la ocupación considera todas las clases físicas del aula en el período para evitar falsos disponibles. |
| Privacidad de conflictos | ADMIN/DIRECCION ven detalle completo. COORDINADOR_AREA y DOCENTE solo ven estado y rango de clases ajenas; horarios inválidos ajenos tampoco exponen valores crudos. |
| Horario inválido con conflicto | Un solapamiento válido demuestra que el aula está ocupada; incidencias adicionales conservan el estado con calidad parcial. Sin conflicto demostrable, una incidencia potencial deja el aula indeterminada. |
| Catálogo histórico de aulas | Actividad, tipo, edificio y vinculaciones son actuales. Las consultas históricas deben indicar `current_classroom_catalog`; no representan un catálogo histórico. |
| Matrícula | `studentCount = null` significa desconocido y `0` significa cero real. Migrar ceros existentes a `null`. |
| Capacidad histórica | `maxCapacity` representa el estado actual del aula. Toda métrica o detalle histórico que la use debe mostrar `current_classroom_capacity`; no se presenta como capacidad histórica. |
| Personal | Mostrar contrato, categoría, jornada y cargos actuales; no atribuirlos a períodos históricos. |
| Personal por carrera | Para COORDINADOR_AREA, el universo actual exige un nombramiento vigente en el `CenterDepartment` autorizado; informes históricos no prueban pertenencia actual. |
| Cargos simultáneos | La distribución por cargo es multivaluada y puede superar 100 %. `Ninguno` se presenta como “Sin cargo académico vigente”. |
| Actividades | Totales y distribución por los tipos actuales. No agregar rol, código semántico ni clasificación emergente. |
| Temporalidad de actividades | Aceptar período o año. En modo anual, PAC y modalidad se seleccionan juntos; docentes con informe entran una vez en el promedio aunque tengan varios informes. |
| Cobertura de actividades | El promedio usa docentes con informe en el alcance temporal; la cobertura usa la intersección de esos docentes con el personal activo actual. |
| Monitoreo | Conservar `isPresent` presente/ausente. No agregar estados operativos adicionales. |
| Scope de monitor | Limitar checklist y analíticas a edificios asignados al monitor. |
| Pizarras | Medir cobertura potencial y uso observado durante chequeos, no “uso real total”. |
| Universo de inventario | Contar pizarras digitales, PC y aires acondicionados asignados actualmente a aulas físicas activas autorizadas. Excluir equipos sin aula, proyectores escalares, audio y conectividad de esta distribución. |
| Uso observado | Estado `USED`, `NOT_USED` o `UNKNOWN` en chequeos presentes de aulas equipadas; ausencia de estado significa no capturado o no aplicable. |
| Exportación | Excel por desglose filtrado, síncrono y con límite controlado. |
| Implementación XLSX | Generar en backend con `xlsx-populate`, reutilizando el mismo pipeline autorizado del detalle, límite de 5000 filas y neutralización de fórmulas. |
| Caché | TanStack Query; no Redis ni vistas materializadas hasta medir una necesidad. |

## 3. Alcance funcional comprometido

### 3.1 Oferta, carga y UV

- Secciones ofertadas por período, año y carrera.
- Secciones asignadas por docente, período y año.
- Asignaturas distintas por docente.
- Historial de asignaciones con asignatura, sección, período, aula y horario.
- UV por docente, período y año, sumadas por sección única.
- UV planificadas por carrera.
- Promedio de secciones y UV entre docentes con asignación.
- Diferencia absoluta y porcentual frente al promedio.
- Comparación manual entre dos períodos autorizados.
- Distribución de reuniones por día y rango horario.

### 3.2 Aulas, matrícula y capacidad

- Aulas activas disponibles u ocupadas para período, día y rango.
- Proporción de aulas elegibles ocupadas en el rango consultado.
- Capacidad instalada de las aulas incluidas.
- Matrícula reportada por sección y suma de matrículas por carrera.
- Promedio por secciones con matrícula conocida.
- Ocupación de sección cuando existe matrícula y capacidad.
- Secciones sobre capacidad y cupos físicos disponibles.
- Cobertura de datos faltantes de matrícula o capacidad.

### 3.3 Personal actual

- Docentes activos en el alcance institucional actual.
- Distribución actual por contrato, categoría, jornada y cargo vigente.
- Tiempo completo solo si negocio identifica de forma inequívoca los registros correspondientes; hasta entonces se muestra la distribución por contrato sin inferir nombres.

### 3.4 Tecnología

- Aulas activas con una o más pizarras digitales.
- Cobertura potencial de aulas equipadas.
- Equipos por tipo, condición y edificio usando los catálogos actuales.
- Matrículas reportadas en secciones asignadas a aulas equipadas.
- Uso observado de pizarras durante chequeos registrados.

### 3.5 Actividades

- Actividades totales.
- Distribución por `ActivityType` actual.
- Actividades por período, año, carrera y docente.
- Promedio entre docentes con un informe existente para el período y alcance, con cobertura sobre docentes activos.

### 3.6 Monitoreo

- Chequeos, presentes, ausentes y cumplimiento.
- Cumplimiento por día, docente, edificio, centro, carrera y período.
- Detalle paginado de chequeos.
- Checklist limitado a edificios asignados.

## 4. Fuera de alcance

- Semestre derivado de PAC.
- Horarios diferentes por día para una misma sección y modelo `CourseSchedule`.
- Utilización institucional por horas-aula, calendario laboral o feriados.
- Historial de contrato y categoría.
- Clasificación automática de tiempo completo por nombre editable.
- Sobrecarga contractual.
- Roles de organización/dirección y actividades emergentes.
- Estados de monitoreo adicionales a presente/ausente.
- Estudiantes únicos.
- Uso de pizarras fuera de observaciones de monitoreo.
- Predicción de oferta o contratación.
- Exportación PDF del dashboard.
- Redis, materialized views y procesamiento asíncrono de exportaciones.

Estas capacidades requieren una nueva validación de negocio antes de incorporarse. No deben agregarse como “preparación futura” dentro de los modelos actuales.

## 5. Arquitectura objetivo mínima

### 5.1 Backend

```text
backend/src/modules/analytics/
├── analytics.module.ts
├── controllers/
│   └── analytics.controller.ts
├── dto/
│   ├── analytics-filters.dto.ts
│   ├── academic-load-filters.dto.ts
│   ├── classroom-availability-filters.dto.ts
│   ├── monitoring-analytics-filters.dto.ts
│   └── analytics-details.dto.ts
├── services/
│   ├── analytics-scope.service.ts
│   ├── academic-load-analytics.service.ts
│   ├── classroom-analytics.service.ts
│   ├── staff-analytics.service.ts
│   ├── technology-analytics.service.ts
│   ├── activity-analytics.service.ts
│   └── monitoring-analytics.service.ts
├── types/
│   ├── analytics-context.type.ts
│   └── analytics-result.type.ts
└── utils/
    └── analytics-coverage.util.ts
```

Usar un servicio por dominio porque sus métricas comparten joins, filtros y denominadores. No crear una clase por tarjeta. Mantener rutas explícitas para conservar DTO, Swagger, autorización y tipos comprensibles.

Rutas iniciales:

```http
GET /analytics/filter-options
GET /analytics/academic-load
GET /analytics/academic-load/details
GET /analytics/academic-load/export
GET /analytics/classrooms
GET /analytics/classrooms/details
GET /analytics/classrooms/export
GET /analytics/staff
GET /analytics/staff/details
GET /analytics/staff/export
GET /analytics/technology
GET /analytics/technology/details
GET /analytics/technology/export
GET /analytics/activities
GET /analytics/activities/details
GET /analytics/activities/export
GET /analytics/monitoring
GET /analytics/monitoring/details
GET /analytics/monitoring/export
```

No todos los roles llamarán todas las rutas. La página cargará cada sección autorizada de forma independiente, permitiendo entrega incremental y evitando una respuesta gigante.

`GET /analytics/filter-options` funciona también como contexto de UI autorizado. Además de catálogos limitados, devuelve dominios disponibles y el modo de cada filtro:

```ts
type AnalyticsUiContext = {
  domains: AnalyticsDomain[];
  filters: Record<AnalyticsFilter, 'hidden' | 'locked' | 'selectable'>;
  defaults: AnalyticsFilters;
  options: {
    periods: FilterOption[];
    centers: FilterOption[];
    centerDepartments: FilterOption[];
    teachers: FilterOption[];
    buildings: FilterOption[];
  };
  capabilities: {
    canComparePeriods: boolean;
    canExport: boolean;
  };
};
```

El frontend no deduce este contexto a partir del nombre del rol ni descarga catálogos globales. CASL protege la ruta general; el contexto del backend decide qué secciones, controles y opciones se renderizan.

Cada ruta `details` y `export` recibe un discriminador `metric` definido por un enum del dominio. Por ejemplo, carga puede permitir `teacher_load`, `offered_sections` y `assigned_uvs`. Cada valor tiene DTO de fila, columnas y orden permitidos explícitos; nunca se convierte directamente en SQL, tabla o nombre de propiedad.

### 5.2 Frontend

```text
frontend/src/api/analytics/
├── analytics.api.ts
├── analytics.keys.ts
├── analytics.options.ts
├── analytics.types.ts
├── useAnalyticsQueries.ts
└── index.ts

frontend/src/features/analytics/
├── pages/AnalyticsPage.tsx
├── routes/AnalyticsRoutes.tsx
├── components/
│   ├── AnalyticsFilters.tsx
│   ├── MetricCard.tsx
│   ├── DataQualityBadge.tsx
│   ├── MetricDetails.tsx
│   └── sections/
└── index.ts
```

Reutilizar `ResponsiveTable`, `Pagination`, `SearchAsyncSelect`, `usePaginationParams`, los patrones de filtros de monitoreo y las utilidades seguras de Excel. No crear una tercera tabla ni introducir una librería de gráficos en la primera entrega. Usar tarjetas, tablas y barras CSS accesibles; agregar una librería solo si un visual aprobado no puede expresarse adecuadamente.

La UI debe respetar el lenguaje visual actual. Usar los tokens semánticos definidos en `frontend/src/App.css`: `background`, `foreground`, `card`, `primary`, `accent`, `muted`, `border`, `success`, `warning`, `info`, sus variantes dark y las sombras/radios existentes. No introducir hexadecimales aislados ni una paleta paralela dentro de Analíticas. Reutilizar primero componentes de `frontend/src/shared/components/ui`; crear uno nuevo únicamente cuando ninguna composición de los existentes cubra correctamente la interacción o accesibilidad requerida.

### 5.3 Contrato común de resultado

Cada indicador numérico debe distinguir cero de ausencia de dato:

```ts
type AnalyticsMetricResult = {
  key: string;
  value: number | null;
  unit:
    | 'sections'
    | 'courses'
    | 'uv'
    | 'enrollments'
    | 'classrooms'
    | 'capacity'
    | 'teachers'
    | 'activities'
    | 'equipment'
    | 'checks'
    | 'percentage';
  numerator?: number;
  denominator?: number;
  dataStatus: 'complete' | 'partial' | 'unavailable' | 'not_applicable';
  coverage?: {
    included: number;
    total: number;
    excluded: number;
    reasons: string[];
  };
};
```

`value: 0` representa un resultado real. `value: null` representa falta de denominador o dato no calculable.

## 6. Matriz de acceso

| Rol | Scope | Secciones |
|---|---|---|
| ADMIN | Global | Todas. |
| DIRECCION | Global, solo lectura analítica | Todas. |
| RRHH | Global para personal | Personal actual, carga y UV; sin monitoreo detallado, actividades ni evidencias. |
| COORDINADOR_AREA | `CenterDepartment` de nombramientos vigentes | Oferta, carga, UV, horarios, aulas, matrícula, personal, tecnología y actividades. |
| DOCENTE | `teacherId` derivado del usuario autenticado | Carga, UV, horarios, aulas, matrícula y actividades propias. |
| MONITOR | Edificios asignados | Checklist, monitoreo, contexto de clases y uso observado de pizarras. |

`@Roles` controla acceso general al endpoint, pero `AnalyticsScopeService` debe producir los filtros de filas. Un ID solicitado siempre se intersecta con el scope efectivo; nunca lo amplía. Los detalles, exportaciones y opciones de filtros deben reutilizar exactamente la misma política.

Para usuarios con varios roles, ADMIN prevalece como scope global. En los demás casos se unen únicamente las capacidades autorizadas de cada rol; una capacidad no hereda el scope de otra. Por ejemplo, MONITOR + DOCENTE conserva vista personal docente y edificios asignados para monitoreo.

## 7. Reglas de cálculo

### 7.1 Entidad base deduplicada

Antes de sumar o contar, construir el universo de secciones únicas desde:

```text
CourseClassroom
→ TeachingSession
→ AcademicAssignmentReport
→ Teacher / AcademicPeriod / CenterDepartment
```

La clave base es `CourseClassroom.id`. Unir días, actividades, pizarras o chequeos no puede multiplicar secciones, UV ni matrícula.

### 7.2 Fórmulas

| Métrica | Fórmula |
|---|---|
| Secciones ofertadas | `COUNT(DISTINCT CourseClassroom.id)`. |
| Asignaturas distintas | `COUNT(DISTINCT CourseClassroom.courseId)`. |
| UV asignadas | Suma de `Course.uvs` por sección única. |
| Matrículas reportadas | Suma de `studentCount` no nulo por sección única. |
| Promedio de matrícula | Suma conocida / secciones con `studentCount != null`. |
| Ocupación de sección | `studentCount / maxCapacity * 100` cuando ambos existen y capacidad es mayor que cero. |
| Cupos | `max(0, maxCapacity - studentCount)`. |
| Cumplimiento | presentes / total de chequeos; `null` cuando total es cero. |
| Cobertura de pizarras | aulas activas con pizarra / aulas activas elegibles. |
| Matrícula con cobertura | Suma conocida de secciones únicas en aulas con pizarra. |
| Uso observado | chequeos `USED` / chequeos `USED + NOT_USED`; `UNKNOWN` se muestra en cobertura. |

### 7.3 Comparación manual

Aceptar `periodId` y `comparisonPeriodId`. Ambos deben existir y pertenecer a opciones autorizadas. Devolver valores actuales, comparables, diferencia absoluta y diferencia porcentual. Si el valor comparable es cero, la diferencia porcentual es `null`.

Para diferencia frente al promedio, devolver `teacherValue - average` y `(teacherValue - average) / average * 100`. Si el promedio es cero, la diferencia porcentual es `null`. Un valor positivo solo significa “encima del promedio”, no sobrecarga.

### 7.4 Horarios y solapamiento

Crear una única utilidad backend para validar y convertir:

```text
days: "LuMaMi"
section: "10:00 - 12:00"
```

Reglas mínimas:

- Solo abreviaturas `Lu`, `Ma`, `Mi`, `Ju`, `Vi`, `Sa`, `Do`.
- Sin días duplicados.
- Formato horario `HH:mm - HH:mm`.
- Hora inicial estrictamente menor que hora final.
- Inicio y fin obligatorios porque la duración varía entre clases.
- Solapamiento cuando `classStart < queryEnd && classEnd > queryStart`.

Reutilizar esta utilidad en creación, edición, importación, disponibilidad y monitoreo. Los registros históricos inválidos se excluyen de métricas horarias y se reportan como cobertura parcial; no deben romper toda la respuesta.

Los formularios deben capturar inicio y fin por separado y enviar el rango canónico. Las importaciones deben aceptar el rango completo en la celda de horario. Una hora legada sin fin no recibe duración inferida: debe corregirse antes de declarar disponibilidad; mientras exista, los flujos operativos fallan de forma conservadora en vez de mostrar el aula como libre.

En disponibilidad, el scope limita qué aulas puede ver el usuario, pero la detección de ocupación debe considerar todas las clases asignadas al aula dentro del período, incluso las de otra carrera. De lo contrario, un aula compartida podría aparecer libre cuando está ocupada fuera del scope académico visible.

La capacidad, condición e inventario no tienen vigencia histórica. Cuando se combinen con un período anterior, la UI debe etiquetarlos como “configuración actual del aula aplicada a las asignaciones seleccionadas”; no debe afirmar que representan el estado físico existente durante ese período.

## 8. Cambios de datos mínimos

### 8.1 Matrícula desconocida

Modificar `CourseClassroom.studentCount` de `Int` a `Int?`.

Aplicar el cambio en dos pasos compatibles. Primero eliminar `NOT NULL` y desplegar backend/frontend capaces de leer ambos estados, sin modificar aún los ceros. Después de retirar instancias antiguas, convertir los ceros:

```sql
UPDATE academic.course_classrooms
SET "studentCount" = NULL
WHERE "studentCount" = 0;
```

Adaptar DTOs, tipos, formularios, importación, dashboard docente, estadísticas de curso y exportaciones para mostrar “Sin información”. Habilitar la captura futura de `null` y `0` como valores distintos junto con el segundo paso.

### 8.2 Asignación de edificios a monitores

Agregar una relación mínima `MonitorBuildingAssignment`:

```text
monitorId  → auth.User.id
buildingId → infraestructure.Building.id
@@unique([monitorId, buildingId])
```

No agregar recorridos, turnos ni historial de vigencia. Administrar la lista de edificios desde la edición del usuario MONITOR, restringida a ADMIN. Eliminar una asignación revoca acceso operativo y analítico futuro; los chequeos históricos permanecen.

Actualizar `GET /monitor/current-assignments`, `GET /monitor/buildings`, creación de chequeos y reportes para aplicar esta relación. Un monitor no puede registrar un chequeo de un edificio no asignado aunque conozca el ID de la sección.

### 8.3 Uso observado de pizarra

Agregar un enum `DigitalBlackboardUseStatus` con `USED`, `NOT_USED` y `UNKNOWN`, y el campo nullable `ScheduleComplianceCheck.digitalBlackboardUseStatus`.

Reglas:

- Solo aplica si la clase está presente y el aula tiene al menos una pizarra registrada.
- `USED` significa usada durante el chequeo.
- `NOT_USED` significa no usada durante el chequeo.
- `UNKNOWN` significa que el monitor no pudo determinarlo.
- `null` significa que la pregunta no aplicaba o que el chequeo es anterior a esta captura.
- Una ausencia siempre guarda `null`.

Incluir `hasDigitalBlackboard` en la asignación del checklist. Para una presencia en aula equipada, abrir el modal y ofrecer las tres opciones. Las confirmaciones rápidas de ausencia continúan disponibles; una presencia equipada no debe saltarse la pregunta. El estado almacenado preserva la elegibilidad histórica aunque luego cambie el inventario del aula. La cobertura de uso observado comienza desde el despliegue de este campo; chequeos legados con `null` no se clasifican retrospectivamente como “no aplicable”.

## 9. Fases de implementación

### Fase 0 — Contratos y datos de referencia

**Objetivo:** impedir que la UI avance sobre fórmulas o datos ambiguos.

1. Aprobar este alcance con negocio.
2. Documentar ejemplos esperados de cada fórmula con un conjunto pequeño de secciones.
3. Identificar los registros de contrato que negocio considera tiempo completo; si no existe una identificación inequívoca, retirar esa tarjeta y conservar distribución por contrato.
4. Auditar valores existentes de `days`, `section`, `studentCount`, `maxCapacity` y relaciones de pizarras.
5. Registrar cuántos horarios no cumplen el formato canónico y corregirlos administrativamente cuando sea posible.
6. Definir presupuesto inicial: p95 menor a 1 segundo para resumen y menor a 2 segundos para detalles con datos representativos.

**Salida:** diccionario aprobado, fixtures de aceptación y reporte de calidad inicial.

### Fase 1 — Integridad mínima y scope

**Objetivo:** establecer datos y autorización seguros antes de publicar indicadores.

1. Hacer nullable `studentCount` sin convertir aún los ceros.
2. Adaptar backend y frontend existentes para leer matrícula nullable.
3. Convertir ceros a `null` y habilitar captura explícita de cero o desconocido.
4. Centralizar parser/validador de `days` y `section` después de auditar y corregir variantes históricas aceptadas.
5. Crear `AnalyticsModule`, DTO base, contrato de métricas y `AnalyticsScopeService`.
6. Registrar el módulo en `backend/src/app.module.ts`.

**Pruebas obligatorias:** compatibilidad antes/después de la migración de ceros, horario válido/inválido, solapamiento de límites y scope por rol.

### Fase 2 — Primer incremento vertical: carga y matrícula

**Objetivo:** entregar valor para DOCENTE, COORDINADOR_AREA, RRHH, DIRECCION y ADMIN.

1. Implementar opciones de período y scope autorizadas.
2. Implementar resumen y detalle de oferta, secciones, asignaturas distintas y UV.
3. Implementar comparación manual entre períodos.
4. Implementar matrícula, capacidad, sobrecapacidad, cupos y cobertura.
5. Crear `frontend/src/api/analytics` con keys que incluyan usuario, sección y filtros normalizados, factories de `queryOptions` y custom hooks de consumo separados.
6. Agregar subject CASL `analytics`, permisos por rol, ruta y navegación.
7. Crear shell `/analytics`, filtros globales y secciones de carga/matrícula mediante composición, tokens visuales existentes y componentes compartidos.
8. Forzar `teacherId` del usuario en vista DOCENTE y limitar coordinación a nombramientos vigentes.
9. Agregar drawers o paneles de detalle con `ResponsiveTable` y paginación estable.
10. Implementar Excel de estos desgloses en backend con `xlsx-populate`, límite controlado y sanitización contra fórmulas.

**Aceptación:** cada tarjeta coincide con su detalle; múltiples días no duplican secciones; UV se suma por sección; matrícula desconocida no se presenta como cero.

**Estado del incremento:** completado. Incluye resumen y detalle de carga y matrícula, comparación manual, calidad/cobertura, scope por filas, filtros por dominio, UI responsive y exportación XLSX autorizada.

### Fase 3 — Aulas, horarios y tecnología

**Objetivo:** responder disponibilidad y cobertura tecnológica sin normalizar horarios.

1. Implementar clases por día y franja usando el parser canónico.
2. Implementar aulas disponibles y ocupadas para período, día y rango.
3. Limitar aulas visibles a las activas y autorizadas, pero evaluar su ocupación contra todas las clases del aula en el período.
4. Implementar capacidad instalada con cobertura de `maxCapacity`.
5. Implementar aulas con pizarras y porcentaje de cobertura potencial.
6. Implementar matrícula conocida en aulas equipadas.
7. Implementar distribuciones de inventario por tipo, condición y edificio sin inferir “operativo”.
8. Agregar secciones frontend, detalles y Excel.

**Aceptación:** los intervalos contiguos no se solapan; los intervalos parciales sí; registros horarios inválidos producen estado parcial y razón visible.

**Estado de la fase:** completada. Incluye distribución de reuniones por día/rango, disponibilidad semanal planificada, capacidad instalada, cobertura potencial de pizarras, matrícula conocida en aulas equipadas, inventario por tipo/condición/edificio, detalles y exportaciones XLSX.

### Fase 4 — Personal y actividades

**Objetivo:** consolidar la fotografía actual de personal y actividades ya registradas.

1. Implementar docentes activos por scope actual.
2. Implementar distribución por contrato, categoría, jornada y cargo vigente.
3. Etiquetar explícitamente las métricas como actuales, no históricas.
4. Implementar actividades totales y por tipo, período, año, carrera y docente.
5. Calcular el promedio sobre docentes que tienen un `AcademicAssignmentReport` existente para el período y alcance; como no hay estado de aprobación/anulación, no inferir otra condición de validez. Mostrar aparte cobertura respecto de docentes activos actuales.
6. Aplicar la matriz especial de RRHH: personal/carga sí, actividades y evidencias no.
7. Agregar secciones frontend, detalles y Excel.

**Aceptación:** cambiar contrato actual no altera ni reetiqueta una serie histórica porque esa serie no se ofrece; docentes sin informe no se cuentan como cero actividades dentro del promedio.

**Estado de la fase:** completada. Incluye personal actual, distribuciones laborales y de cargos vigentes, actividades por período o año, promedio sobre docentes con informe, cobertura sobre personal activo, detalles, filtros autorizados y exportaciones XLSX.

### Fase 5 — Monitoreo y uso observado

**Objetivo:** integrar el reporte existente con scope correcto y calidad analítica.

1. Crear `MonitorBuildingAssignment` y sus operaciones administrativas mínimas.
2. Aplicar edificios asignados al checklist, creación de chequeos y reportes existentes.
3. Agregar `digitalBlackboardUseStatus` y extender el flujo online/offline de monitoreo.
4. Mover o reutilizar la lógica de filtros de `MonitorReportsService` sin duplicarla.
5. Devolver cumplimiento `null` cuando no hay chequeos.
6. Agregar agrupaciones por centro, carrera y período.
7. Aplicar edificios asignados a MONITOR y scope global a ADMIN/DIRECCION.
8. Implementar uso observado de pizarra y su cobertura.
9. Reutilizar los componentes de `monitor-reports` dentro de `/analytics` mediante props tipadas, sin copiarlos.
10. Mantener el checklist operacional en su dashboard actual; `/analytics` muestra resultados, no captura.
11. Agregar detalle y Excel de chequeos y uso observado.

**Aceptación:** ausencia de chequeos no produce `0 %`; uso desconocido no entra al denominador; MONITOR no puede consultar ni registrar fuera de sus edificios.

**Estado de la fase:** completada. Incluye asignación ADMIN de edificios, scope operacional y analítico por filas, captura de uso observado, replay offline idempotente con cola IndexedDB para sesiones abiertas, cortes diarios en `America/Tegucigalpa`, agrupaciones completas, detalle paginado y exportación XLSX. No se declara soporte PWA de arranque en frío porque la aplicación aún no incorpora service worker.

### Fase 6 — Seguridad, migraciones y cierre

**Objetivo:** endurecer la solución después de contar con consultas reales.

1. Añadir `orderBy` estable y máximo de página a todos los detalles.
2. Medir p50/p95, filas procesadas y tamaño de respuesta por endpoint.
3. Revisar índices según planes reales de consulta; no agregarlos por intuición.
4. Usar `EXPLAIN (ANALYZE, BUFFERS)` para endpoints que incumplan el presupuesto.
5. Reescribir con `$queryRaw` parametrizado únicamente las agregaciones que lo necesiten.
6. Configurar `staleTime` por dominio y fecha del período.
7. Verificar invalidación por mutaciones de sección, aula, actividad, docente y chequeo.
8. Ejecutar revisión de seguridad por IDOR y pruebas cruzadas de roles.
9. Ejecutar aceptación de negocio con los fixtures aprobados en Fase 0.

**Estado de la fase:** en progreso. La revisión técnica cerró los hallazgos de mayor riesgo: actualización arbitraria de usuarios restringida a ADMIN, matriz backend de roles otorgables, cola offline aislada por usuario, snapshot histórico de edificio por chequeo, validación de período/día/horario y unicidad diaria por sección. Prisma valida, backend y frontend compilan, y las pruebas automatizadas cubren los límites de roles y captura. Quedan bloqueadas por entorno la aplicación/auditoría de migraciones, el backfill histórico de matrícula y la aceptación visual autenticada por rol. Las optimizaciones de consulta se mantienen condicionadas a mediciones reales.

## 10. Estrategia frontend

### 10.0 Arquitectura de componentes y estado

Separar presentación, orquestación y acceso a datos:

- Las páginas componen secciones y resuelven layout, filtros de URL y capacidades; no implementan consultas HTTP ni fórmulas de negocio.
- Los componentes de sección consumen hooks del dominio y componen tarjetas, estados y detalles.
- Los componentes visuales reciben datos de presentación ya tipados; no conocen endpoints ni roles.
- Las transformaciones reutilizables viven en funciones puras, no dentro del JSX ni de efectos.
- Los cálculos de negocio permanecen en backend; frontend solo adapta formatos y etiquetas.

Aplicar composition patterns en páginas y componentes complejos:

- Preferir `children`, slots y compound components cuando varias piezas comparten contexto de UI.
- Crear variantes explícitas en lugar de acumular props booleanas como `isTeacher`, `isMonitor`, `showExport` o `compact`.
- Mantener el estado compartido de una composición en su provider más cercano, con una interfaz de estado/acciones, sin acoplar consumidores a su implementación.
- No hacer prop drilling de respuestas analíticas a través de capas que no las usan.
- No crear contextos globales para copiar datos que ya administra TanStack Query.

Reglas de estado:

- TanStack Query es la fuente de verdad para server state. No copiar `data`, `isLoading` o `error` a `useState`.
- Derivar valores durante render o mediante `select`; no sincronizarlos con `useEffect`.
- Usar `useState` solo para estado de interacción realmente local, como apertura de modal, pestaña temporal o borrador no persistido.
- Conservar filtros compartibles en search params, no duplicarlos en estado local.
- Ejecutar lógica iniciada por el usuario directamente en event handlers.
- Reservar `useEffect` para sincronización con sistemas externos que no pueda expresarse de forma declarativa. Cada efecto nuevo debe justificar explícitamente esa necesidad en revisión.
- No añadir `useMemo` o `useCallback` por defecto; usarlos únicamente ante una identidad requerida o un costo medido.

Reglas de tipado frontend:

- No usar `any`, `unknown` ni `never`, explícitos o como escape de diseño.
- No usar assertions `as Type`, assertions dobles ni non-null assertions para forzar compatibilidad.
- `as const` está permitido únicamente para preservar literales o tuplas readonly; combinarlo con `satisfies` cuando también deba validarse una estructura.
- Priorizar inferencia, tipos derivados de contratos, `satisfies`, discriminated unions y type guards reales.
- Si una API externa carece de tipos suficientes, encapsularla detrás de un adaptador tipado en vez de propagar casts por componentes.
- Toda entrega frontend debe ejecutar una búsqueda textual sobre archivos nuevos/modificados para verificar estas restricciones.

### 10.0.1 TanStack Query

Separar definición de queries y consumo:

```ts
// analytics.options.ts
export const academicLoadOptions = (filters: AcademicLoadFilters) =>
  queryOptions({
    queryKey: analyticsKeys.academicLoad(filters),
    queryFn: () => analyticsApi.getAcademicLoad(filters),
    staleTime: resolveAnalyticsStaleTime(filters),
  });

// useAnalyticsQueries.ts
export const useAcademicLoad = (filters: AcademicLoadFilters) =>
  useQuery(academicLoadOptions(filters));
```

Las factories de `queryOptions` deben ser la definición única de `queryKey`, `queryFn`, `staleTime` y opciones compartidas. Los custom hooks encapsulan `useQuery`, `useQueries` o `useMutation` y añaden únicamente comportamiento específico de React. Las mismas options se reutilizan en prefetch, invalidación y lectura/escritura del cache.

Es válido llamar el mismo custom hook desde varios componentes cuando usa la misma key y filtros normalizados. TanStack Query comparte el cache y deduplica la solicitud; no elevar ni propagar la respuesta solo para evitar llamadas al hook. Cada consumidor debe seleccionar la porción que necesita mediante `select` cuando eso reduzca sus suscripciones.

No crear waterfalls entre dominios independientes. Una vez disponible el contexto autorizado, montar o precargar en paralelo las queries visibles. Usar `enabled` únicamente para dependencias reales, como esperar un `periodId` efectivo, no para coordinar manualmente estados mediante efectos.

### 10.1 Composición por capacidades

`AnalyticsPage` obtiene las capacidades efectivas y monta solo las secciones permitidas. No usar una cadena extensa de `if (role === ...)`; CASL controla acceso visual y el backend controla datos.

Antes de solicitar métricas, la página consulta `GET /analytics/filter-options`:

- `hidden`: el filtro no se renderiza ni se incluye en la URL o peticiones.
- `locked`: se muestra como contexto de solo lectura, usando el valor efectivo retornado por backend.
- `selectable`: se muestra el control con únicamente las opciones autorizadas.

Ejemplos:

| Rol | Comportamiento de filtros |
|---|---|
| DOCENTE | Docente bloqueado al usuario actual; sin selector de docentes. |
| COORDINADOR_AREA | Carrera seleccionable solo entre sus `CenterDepartment`; docentes limitados a la carrera elegida. |
| MONITOR | Edificio seleccionable solo entre sus asignaciones; sin centros o edificios globales. |
| RRHH | Docente, contrato y categoría seleccionables; dominios de monitoreo y actividades no se montan. |
| DIRECCION / ADMIN | Selectores institucionales completos según el dominio. |

Si cambian permisos durante una sesión y un endpoint responde `403`, el frontend invalida el contexto y las queries analíticas, vuelve a consultar capacidades y muestra un mensaje de permisos actualizados. No conserva ni reintenta automáticamente el filtro rechazado.

Vista inicial por rol:

| Rol | Vista inicial |
|---|---|
| DOCENTE | Mi carga, UV, horario, matrícula y actividades del período actual. |
| COORDINADOR_AREA | Resumen de su primera carrera autorizada, con selector. |
| MONITOR | Cumplimiento y uso observado de sus edificios. |
| RRHH | Personal actual y carga comparativa. |
| DIRECCION | Resumen institucional con todas las secciones. |
| ADMIN | Igual que DIRECCION, con todos los filtros. |

### 10.2 Filtros

Conservar en search params al menos `periodId`, `comparisonPeriodId`, `year`, `pac`, `pacModality`, `centerId`, `centerDepartmentId`, `teacherId`, `buildingId`, `day`, `startTime`, `endTime`, `dateFrom` y `dateTo`. Los DTO deben definir si una consulta acepta período concreto o agregación anual y rechazar combinaciones ambiguas. Cambiar un filtro reinicia la paginación del detalle abierto.

Las opciones deben venir del backend ya restringidas. No cargar catálogos globales y filtrarlos en React. Al inicializar desde search params, descartar cualquier parámetro cuyo filtro no sea `selectable` o cuyo valor no aparezca en las opciones autorizadas; después escribir en la URL los defaults efectivos. Esta limpieza mejora la experiencia, pero el backend sigue validando cada solicitud.

### 10.3 Query keys y caché

```text
['analytics', domain, authenticatedUserId, normalizedFilters]
```

Política inicial:

| Datos | `staleTime` |
|---|---:|
| Período finalizado según `endDate` | 24 horas |
| Período vigente | 30 minutos |
| Monitoreo histórico | 30 minutos |
| Monitoreo del día | 1 minuto |
| Opciones de filtros | 1 hora |

Usar `placeholderData` al cambiar filtros y no reconstruir tarjetas a partir de páginas de detalle. Limpiar el QueryClient al cerrar sesión para impedir reutilización entre usuarios.

### 10.4 Excel

Extraer de monitoreo una utilidad compartida para:

- importar `exceljs` dinámicamente;
- sanitizar celdas que empiezan con `=`, `+`, `-` o `@`;
- crear workbook, encabezados y nombre de archivo;
- descargar mediante `Blob`.

Cada dominio declara columnas y transforma filas. Su endpoint `export` ejecuta una consulta única con orden estable y devuelve el dataset JSON completo solo cuando no supera el límite configurado. Si el total excede ese límite, responde antes de transferir filas y la UI pide filtros más específicos. El frontend genera el workbook con la respuesta; nunca concatena páginas que podrían cambiar durante la exportación ni genera un archivo parcial sin advertencia.

### 10.5 Presentación y visualizaciones

La página combina cuatro niveles de información:

1. Contexto y filtros autorizados.
2. Resumen ejecutivo de cuatro a seis tarjetas prioritarias.
3. Secciones por dominio con visualizaciones comparativas.
4. Desglose auditable en drawer o panel con tabla paginada y exportación.

No representar todos los valores como charts. Elegir la visualización según la pregunta:

| Información | Presentación principal |
|---|---|
| Total, promedio, porcentaje o cobertura | Tarjeta KPI con unidad, estado de calidad y comparación opcional. |
| Distribución por docente, contrato, categoría, actividad, edificio o condición | Barras horizontales ordenadas, con valor y porcentaje visibles. |
| Comparación manual entre dos períodos | Barras lado a lado y resumen de diferencia absoluta/porcentual. |
| Concentración por día y hora | Matriz día × franja tipo heatmap, construida como grid accesible. |
| Ocupación de sección | Barra de progreso con capacidad, matrícula conocida y estado de sobrecapacidad. |
| Disponibilidad de aulas | Tabla o lista de aulas para el rango consultado, separando disponibles y ocupadas. |
| Cumplimiento por fecha | Barras por día; usar línea únicamente cuando exista una serie temporal suficientemente larga. |
| Uso observado de pizarra | Barra apilada o distribución `usada / no usada / desconocida`, junto con cobertura. |
| Registros individuales | `ResponsiveTable` en desktop y tarjetas móviles. |

Cada visualización debe incluir:

- título y definición breve;
- valor exacto visible, no solo posición o color;
- unidad y denominador cuando corresponda;
- badge de calidad `complete`, `partial` o `unavailable`;
- estado vacío que explique si faltan datos o filtros;
- acceso al desglose que usa el mismo universo de datos;
- color acompañado por texto, icono o patrón para no depender únicamente de percepción cromática.

Implementar inicialmente tarjetas, barras, progreso y heatmap con HTML/CSS y tokens existentes. No agregar una librería de charts solo para estas visualizaciones. Reabrir esa decisión si se aprueban líneas complejas, tooltips interactivos, múltiples series o navegación dentro del gráfico que resulte costosa o menos accesible de mantener manualmente.

Composición sugerida por dominio:

| Sección | Resumen | Visualización | Desglose |
|---|---|---|---|
| Carga académica | Secciones, asignaturas distintas, UV y promedio | Barras por docente y comparación de períodos | Docente, curso, sección, UV, aula y horario. |
| Matrícula/capacidad | Matrículas conocidas, cobertura y sobrecapacidad | Ocupación por sección | Secciones con capacidad, matrícula, porcentaje y cupos. |
| Horarios/aulas | Aulas disponibles y ocupadas | Heatmap y lista por rango | Aula, edificio, clase conflictiva y horario. |
| Personal | Docentes activos | Barras por contrato, categoría, jornada y cargo | Docentes y atributos actuales. |
| Tecnología | Aulas equipadas y cobertura potencial | Barras por condición/edificio | Aula y equipos relacionados. |
| Actividades | Total, promedio y cobertura | Barras por tipo | Actividad, docente, informe y período. |
| Monitoreo | Chequeos, presentes, ausentes y cumplimiento | Barras por día/docente/edificio | Chequeos individuales y observaciones. |
| Uso de pizarra | Uso observado y cobertura | Barra apilada por estado | Chequeos elegibles y estado capturado. |

## 11. Pruebas

### 11.1 Backend unitarias

- Scope por cada rol y combinación relevante de roles.
- Contexto UI devuelve dominios y modos de filtro correctos por rol.
- Opciones de filtros no contienen docentes, carreras o edificios fuera del scope.
- Intersección y rechazo de filtros fuera del scope.
- UV por sección y asignaturas distintas.
- Comparación con base cero.
- Matrícula `null`, cero real y capacidad nula/cero.
- Denominador vacío y estado de calidad.
- Parsing de días, rango y solapamiento.
- Pizarra usada/no usada/desconocida/no aplicable.
- Promedio de actividades y cobertura.

### 11.2 Backend integración/e2e

- Resumen y detalle usan el mismo universo.
- Una sección con varios días se cuenta una sola vez.
- Un join con varias pizarras o chequeos no duplica matrícula ni UV.
- DOCENTE no consulta otro docente.
- COORDINADOR_AREA no consulta otra carrera.
- MONITOR no consulta ni registra otro edificio.
- RRHH no accede a monitoreo o actividades.
- Search params o IDs manipulados no amplían opciones ni resultados.
- Paginación estable con orden repetible.

### 11.3 Frontend

El frontend no posee test runner. No introducir uno solo para esta feature en la primera fase. Verificar cada incremento mediante `npm run lint`, `npm run build` y una matriz manual desktop/móvil de rutas, filtros, estados vacío/parcial/error, detalles y exportación. Si el proyecto adopta Vitest posteriormente, priorizar filtros URL, composición por capacidad y transformadores de Excel.

La revisión frontend también debe comprobar:

- ausencia de server state duplicado en `useState`;
- ausencia de efectos usados para derivar o sincronizar datos de queries;
- `queryOptions` separadas de sus custom hooks;
- keys idénticas para consumidores de los mismos filtros;
- ausencia de prop drilling de respuestas analíticas;
- componentes compuestos sin proliferación de props booleanas;
- uso exclusivo de tokens de color y componentes visuales existentes, salvo excepción justificada;
- paridad visual y funcional en modo claro, oscuro, desktop y móvil.

## 12. Índices candidatos, sujetos a medición

Evaluar después de observar los `where` finales:

```text
AcademicAssignmentReport(periodId, centerDepartmentId, teacherId)
CourseClassroom(teachingSessionId, classroomId, courseId)
ComplementaryActivity(assignmentReportId, activityTypeId)
ScheduleComplianceCheck(checkDate, courseClassroomId, monitorId)
MonitorBuildingAssignment(monitorId, buildingId)
```

No es posible indexar de manera útil los días concatenados o el rango textual para solapamiento. Si disponibilidad incumple el presupuesto con volumen real, esa evidencia reabre la decisión de normalizar horarios; no se normalizan preventivamente.

## 13. Orden de despliegue

1. Auditar y corregir formatos horarios incompatibles antes de activar validación estricta.
2. Desplegar el cambio nullable de columna junto con backend/frontend capaces de leer cero y `null`, manteniendo temporalmente la captura numérica existente.
3. Confirmar que no quedan instancias antiguas y ejecutar la conversión de ceros a `null`.
4. Habilitar la captura diferenciada de cero y desconocido.
5. Habilitar endpoints analíticos académicos y `/analytics` por rol de forma incremental.
6. En Fase 5, desplegar `MonitorBuildingAssignment` y `DigitalBlackboardUseStatus` junto con backend/frontend compatibles.
7. Comparar resultados contra fixtures y reportes operacionales existentes.
8. Retirar cualquier cálculo duplicado solo después de confirmar paridad.

No reemplazar inicialmente el dashboard de monitoreo ni el consolidado actual. Reutilizarlos o mantenerlos durante la validación y decidir su retiro en una tarea posterior.

## 14. Definición de terminado por incremento

Un dominio está terminado únicamente cuando:

- aplica scope efectivo en backend;
- distingue cero, desconocido y no calculable;
- devuelve cobertura cuando excluye registros;
- tiene resumen y detalle reconciliables;
- pagina y ordena de manera estable;
- funciona en desktop y móvil;
- respeta la paleta, tokens, dark mode y componentes compartidos existentes;
- mantiene server state en TanStack Query y separa `queryOptions` de custom hooks;
- usa composición y evita prop drilling o efectos de sincronización innecesarios;
- exporta el mismo universo filtrado cuando aplica;
- posee pruebas backend de fórmulas y autorización;
- cumple el presupuesto de rendimiento o documenta la optimización necesaria;
- fue validado con ejemplos de negocio.

## 15. Archivos existentes con impacto directo

| Área | Archivos principales |
|---|---|
| Prisma | `backend/prisma/schema.prisma`, `backend/prisma/migrations/` |
| Registro de módulo | `backend/src/app.module.ts` |
| Secciones y matrícula | `backend/src/modules/course-classrooms/`, `frontend/src/features/academic/planifications/`, `frontend/src/api/courses/`, `frontend/src/api/assignment-reports/` |
| Disponibilidad | `backend/src/modules/infraestructure/services/classroom.service.ts` |
| Importación | `backend/src/modules/teaching-assignment/services/academic-assignment-reports.service.ts` |
| Monitoreo | `backend/src/modules/monitor/`, `frontend/src/api/monitor/`, `frontend/src/features/dashboard/components/monitor-checklist/` |
| Reportes monitor | `frontend/src/features/dashboard/components/monitor-reports/` |
| Permisos frontend | `frontend/src/config/lib/casl/ability.ts` |
| Rutas | `frontend/src/router/AppRouter.tsx` |
| Navegación | `frontend/src/shared/components/navigation/Navbar.tsx` |
| Tablas | `frontend/src/shared/components/ui/ResponsiveTable.tsx` |

## 16. Primer bloque ejecutable

La primera implementación debe limitarse a Fase 0 y Fase 1. No comenzar tarjetas ni gráficos hasta completar:

1. auditoría de horarios y matrícula;
2. migración de `studentCount`;
3. parser horario compartido;
4. contrato de resultados y scope analítico con pruebas.

Este bloque reduce los riesgos de seguridad y calidad que afectarían todas las métricas posteriores y evita rehacer la UI analítica.
