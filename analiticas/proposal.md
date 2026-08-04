# Propuesta técnica — Plataforma escalable de Analíticas SGOA

**Estado:** Propuesta de arquitectura
**Fecha:** 2 de agosto de 2026
**Stack objetivo:** NestJS + Prisma + PostgreSQL + React + TanStack Query

## 1. Decisión propuesta

Crear un **módulo de lectura analítica** separado de los CRUD actuales, con una API orientada a la pantalla y un registro explícito de métricas. La infraestructura será genérica, pero cada métrica conservará una implementación controlada, tipada, autorizada y optimizable.

No se propone un endpoint por tarjeta ni un endpoint `POST /analytics/query` que permita al frontend construir consultas arbitrarias.

Patrones aplicados:

- **Backend for Frontend:** una respuesta compone las secciones que necesita la página.
- **CQRS de lectura liviano:** Analíticas es un modelo de consulta separado, sin event sourcing.
- **Registry + Strategy:** `metricKey` selecciona una implementación permitida.
- **Query Object:** cada métrica encapsula filtros, cálculo, calidad y desglose.

## 2. Objetivos de arquitectura

1. Agregar métricas sin multiplicar endpoints.
2. Mantener reglas y permisos en backend.
3. Ejecutar agregaciones en PostgreSQL, no en React ni sobre grandes arrays en NestJS.
4. Evitar duplicación antes de sumar UV, matrículas o secciones.
5. Devolver valor, denominador, cobertura, calidad y contexto.
6. Reutilizar resultados mediante caché largo, especialmente para períodos cerrados.
7. Permitir detalle auditable y paginado sin cargarlo con el dashboard inicial.

## 3. API propuesta

### 3.1 Dashboard compuesto

```http
GET /analytics/dashboard
  ?periodId=...
  &centerDepartmentId=...
  &teacherId=...
  &buildingId=...
  &sections=academicLoad,enrollment,monitoring
```

Devuelve tarjetas y series de las secciones solicitadas. El servidor ignora o rechaza filtros fuera del scope autorizado.

```json
{
  "context": {
    "periodId": "...",
    "scope": { "centerDepartmentIds": ["..."] },
    "generatedAt": "2026-08-02T16:00:00Z"
  },
  "sections": {
    "academicLoad": {
      "metrics": {
        "offeredSections": {
          "value": 43,
          "unit": "sections",
          "dataStatus": "complete"
        },
        "assignedUvs": {
          "value": 156,
          "unit": "uv",
          "dataStatus": "complete"
        }
      },
      "series": {
        "sectionsByPeriod": [
          { "periodId": "...", "label": "2026 PAC I", "value": 43 }
        ]
      }
    },
    "monitoring": {
      "metrics": {
        "complianceRate": {
          "value": 92.4,
          "unit": "percentage",
          "numerator": 231,
          "denominator": 250,
          "dataStatus": "complete"
        }
      }
    }
  }
}
```

`sections` evita calcular dominios que la pantalla no muestra. Las secciones permitidas y métricas incluidas se resuelven en backend según rol y scope.

### 3.2 Desglose genérico y controlado

```http
GET /analytics/metrics/:metricKey/details
  ?periodId=...
  &page=1
  &size=25
  &sort=assignedUvs:desc
```

Ejemplos de keys: `offered_sections`, `assigned_uvs`, `enrollment_capacity`, `monitoring_compliance`.

El `metricKey` se resuelve contra un registry; no se transforma directamente en SQL, tabla o columna.

```json
{
  "metric": "assigned_uvs",
  "columns": [
    { "key": "teacher", "label": "Docente", "type": "text" },
    { "key": "sectionCount", "label": "Secciones", "type": "number" },
    { "key": "assignedUvs", "label": "UV", "type": "number" }
  ],
  "rows": [],
  "pagination": { "page": 1, "size": 25, "total": 84 }
}
```

Las columnas pueden declararse por métrica para una tabla reutilizable, pero el backend controla el conjunto y el frontend conserva componentes específicos cuando la experiencia lo requiera.

### 3.3 Opciones de filtros

```http
GET /analytics/filter-options?periodId=...
```

Solo debe crearse si los endpoints actuales no pueden devolver catálogos ya limitados por scope. Puede consolidar períodos, carreras, docentes, edificios y aulas disponibles para el usuario.

### 3.4 Exportaciones

Opcional en la primera entrega:

```http
POST /analytics/exports
GET /analytics/exports/:exportId
```

La exportación recibe una `metricKey` o sección, filtros y formato. Debe ser asíncrona solo si el volumen o tiempo lo justifica. Las exportaciones pequeñas pueden reutilizar el detalle paginado con un límite controlado.

### 3.5 Cantidad de endpoints

- Esenciales: **2** (`dashboard`, `details`).
- Recomendados con filtros: **3**.
- Con exportación asíncrona: **5**.

Agregar cinco métricas nuevas normalmente amplía el registry, consultas y UI, no la cantidad de endpoints.

## 4. Diseño del backend

Estructura conceptual:

```text
src/modules/analytics/
├── analytics.module.ts
├── controllers/analytics.controller.ts
├── dto/analytics-filters.dto.ts
├── dto/metric-details.dto.ts
├── registry/analytics.registry.ts
├── context/analytics-scope.service.ts
├── services/dashboard-query.service.ts
├── services/metric-details.service.ts
├── metrics/
│   ├── academic-load/
│   ├── enrollment/
│   ├── teaching-staff/
│   ├── classrooms/
│   ├── activities/
│   └── monitoring/
└── types/analytics-result.ts
```

Contrato conceptual de una métrica:

```ts
interface AnalyticsMetric {
  key: MetricKey;
  section: AnalyticsSection;
  authorize(context: AnalyticsContext, filters: AnalyticsFilters): void;
  getSummary(context: AnalyticsContext, filters: AnalyticsFilters): Promise<MetricResult>;
  getDetails(context: AnalyticsContext, filters: AnalyticsFilters, page: PageRequest): Promise<MetricDetails>;
}
```

El registry es un `Map<MetricKey, AnalyticsMetric>` construido mediante providers de NestJS. Solo contiene keys conocidas. El dashboard solicita las métricas registradas para cada sección y puede ejecutarlas en paralelo con concurrencia limitada.

## 5. Filtros y autorización

### 5.1 Filtros comunes

- `periodId` o `year`;
- `centerId`;
- `centerDepartmentId`;
- `teacherId`;
- `courseId`;
- `buildingId`;
- `classroomId`;
- fechas para monitoreo;
- agrupación específica permitida.

No todos los filtros aplican a todas las métricas. Cada estrategia declara los que acepta.

### 5.2 Scope calculado en backend

`AnalyticsScopeService` deriva un contexto desde el usuario autenticado y sus cargos:

- Docente: fuerza su propio `teacherId`.
- Coordinador: limita a sus `centerDepartmentId` vigentes.
- Monitor: limita a centros/edificios autorizados conforme a la regla operativa definida.
- Administrador: scope global.

El filtro solicitado se intersecta con el scope; nunca lo expande. El mismo contexto debe usarse en dashboard, detalles, exportación y opciones.

## 6. Estrategia de consultas

### 6.1 Prisma vs SQL parametrizado

Usar Prisma para conteos simples, catálogos, filtros de una entidad y detalles paginados. Usar `$queryRaw` parametrizado para:

- `COUNT(DISTINCT ...)` a través de relaciones;
- CTE de deduplicación;
- múltiples agregados con `FILTER`;
- comparaciones históricas;
- solapamiento y disponibilidad;
- series y agrupaciones por relaciones.

Nunca interpolar nombres o valores enviados por el cliente dentro de strings SQL. `metricKey`, orden y agrupación se resuelven mediante allowlists.

### 6.2 Patrón de deduplicación

Antes de agregar carga docente:

```sql
WITH unique_assignments AS (
  SELECT DISTINCT
    aar."teacherId",
    aar."periodId",
    aar."centerDepartmentId",
    cc.id AS "courseClassroomId",
    cc."courseId"
  FROM academic.course_classrooms cc
  JOIN academic.teaching_sessions ts ON ts.id = cc."teachingSessionId"
  JOIN academic.academic_assignment_reports aar
    ON aar.id = ts."assignmentReportId"
  WHERE aar."periodId" = $1
)
SELECT
  "teacherId",
  COUNT(*) AS "sectionCount",
  COUNT(DISTINCT "courseId") AS "courseCount"
FROM unique_assignments
GROUP BY "teacherId";
```

La forma final debe ajustarse a los nombres físicos generados por Prisma y validarse en PostgreSQL, pero el principio es obligatorio: deduplicar la entidad base antes de unir relaciones uno-a-muchos.

### 6.3 Cálculos propuestos

| Métrica | Cálculo técnico |
|---|---|
| Secciones ofertadas | `COUNT(DISTINCT cc.id)`. |
| Asignaturas distintas | `COUNT(DISTINCT cc.courseId)`. |
| UV asignadas | Suma de `Course.uvs` después de deduplicar docente-sección. |
| Matrículas reportadas | `SUM(cc.studentCount)` sobre secciones únicas. |
| Ocupación de sección | `studentCount / maxCapacity * 100`; `null` sin capacidad o denominador válido. |
| Secciones sobre capacidad | Conteo con `studentCount > maxCapacity`. |
| Aulas con pizarra | `COUNT(DISTINCT Classroom.id)` con referencia a pizarra y aula activa. |
| Matrículas con cobertura de pizarra | Suma de matrícula de secciones distintas en aulas equipadas. |
| Actividades | `COUNT(DISTINCT ComplementaryActivity.id)` agrupado por tipo/informe. |
| Cumplimiento | presentes / chequeos válidos; devolver numerador y denominador. |

### 6.4 Comparación entre períodos

El backend debe resolver un período comparable según año, PAC y modalidad. Devuelve:

```json
{
  "current": 43,
  "previous": 40,
  "absoluteChange": 3,
  "percentageChange": 7.5
}
```

Si el valor anterior es cero, `percentageChange` es `null`.

### 6.5 Horarios normalizados

Después de `CourseSchedule`, una reunión se superpone con un bloque cuando:

```text
class.startTime < block.endTime
AND class.endTime > block.startTime
```

Disponibilidad usa `NOT EXISTS` sobre horarios solapados. Para una primera versión de utilización institucional se recomiendan bloques normalizados de 30 o 60 minutos, porque son auditables y evitan sumar dos veces intervalos conflictivos. La métrica por horas exactas puede añadirse tras validar que no existan solapamientos.

## 7. Contrato de resultados y calidad

Cada métrica debe devolver como mínimo:

```json
{
  "key": "classroom_occupancy",
  "value": 65,
  "unit": "percentage",
  "numerator": 52,
  "denominator": 80,
  "dataStatus": "partial",
  "coverage": {
    "included": 38,
    "total": 43,
    "excluded": 5,
    "reasons": ["classroom_without_capacity"]
  }
}
```

Estados sugeridos: `complete`, `partial`, `unavailable`, `not_applicable`. Un cero real conserva `value: 0`; falta de denominador usa `value: null`.

## 8. Flujo de datos backend–frontend

1. La ruta `/analytics` determina la vista por rol.
2. El frontend obtiene opciones autorizadas y selecciona filtros iniciales.
3. TanStack Query solicita `/analytics/dashboard` con secciones visibles.
4. NestJS valida DTO, deriva scope e intersecta filtros.
5. El servicio de dashboard resuelve las métricas registradas.
6. PostgreSQL calcula agregados; NestJS compone respuesta y calidad.
7. React renderiza tarjetas y gráficos sin recalcular totales.
8. Al abrir una tarjeta, se consulta `/analytics/metrics/:metricKey/details`.
9. Mutaciones relevantes invalidan únicamente las keys afectadas.

El detalle de una tabla paginada nunca debe usarse para reconstruir el total del indicador.

## 9. Estrategia de caché

### 9.1 Frontend con TanStack Query

Query key recomendada:

```text
['analytics', 'dashboard', userScopeFingerprint, sections, normalizedFilters]
```

El fingerprint no debe contener datos sensibles; solo una identidad estable del scope efectivo. Los filtros deben normalizarse para evitar keys diferentes por orden de propiedades.

Política recomendada:

| Tipo de dato | `staleTime` sugerido | Motivo |
|---|---:|---|
| Período cerrado/histórico | 24 horas o `Infinity` durante sesión | El resultado no debería cambiar. |
| Período abierto — carga, aulas, matrícula, actividades | 30–60 minutos | Se pidió caché largo y los cambios no requieren refresco por segundos. |
| Monitoreo histórico | 30–60 minutos | Estable salvo correcciones. |
| Monitoreo del día | 1–5 minutos | Es información operacional cambiante. |
| Catálogos de filtros | 1–24 horas | Cambian con baja frecuencia. |

Configurar `gcTime` mayor que `staleTime`, `refetchOnWindowFocus: false` para dashboards históricos y `placeholderData` para transiciones de filtros. Usar prefetch al entrar a Analíticas y cargar el desglose solo al abrirlo.

### 9.2 Invalidación

Las mutaciones deben invalidar por dominio:

- planificación/sección → `academicLoad`, `enrollment`, `classrooms`;
- aula/equipamiento → `classrooms`, `technology`, `enrollmentCapacity`;
- actividad → `activities`;
- chequeo → `monitoring` del día/período;
- docente/contrato/categoría → `teachingStaff` y comparaciones de carga.

Para períodos cerrados, evitar invalidación salvo reapertura o corrección administrativa.

### 9.3 Caché de servidor

TanStack Query evita peticiones repetidas en un cliente, pero no comparte resultados entre usuarios. Iniciar sin Redis. Si la medición muestra repetición costosa, añadir caché en backend con key:

```text
analytics:{metricVersion}:{scopeHash}:{filtersHash}:{sections}
```

TTL sugerido igual o menor que el frontend. Incluir una versión de definición para invalidar resultados cuando cambie una fórmula. No cachear respuestas antes de aplicar scope.

## 10. UI de alto nivel

### 10.1 Ruta y estructura

Agregar un acceso principal **Analíticas** y la ruta `/analytics`. Estructura:

1. Encabezado con período y scope activo.
2. Filtros globales autorizados.
3. Resumen ejecutivo de 4–6 tarjetas prioritarias.
4. Secciones por dominio con tarjetas, gráficos y tablas breves.
5. Drawer o página secundaria para desglose de una métrica.
6. Indicadores de cobertura/calidad y definiciones accesibles.

### 10.2 Composición por rol

| Rol | Vista inicial |
|---|---|
| Docente | Mi carga, UV, horarios, matrícula y mis actividades; período actual con selector histórico. |
| Coordinador | Resumen de carrera; carga comparada, oferta, matrícula, aulas, tecnología y actividades. |
| Monitor | Cumplimiento, chequeos, distribución por edificio/docente y contexto de clases programadas. |
| Administrador | Resumen institucional y acceso a todas las secciones y scopes. |

El administrador no necesita una implementación paralela: usa la misma pantalla con scope global. Dirección/RR. HH. deben agregarse solo después de definir permisos.

### 10.3 Componentes visuales

- Tarjetas para totales, porcentajes y variaciones.
- Barras para distribuciones por contrato, categoría, actividad o franja.
- Líneas para tendencias por período.
- Heatmap día × franja después del refactor de horarios.
- Tabla ordenable para carga docente y sobrecapacidad.
- Badges de calidad: completo, parcial o no disponible.

Cada visual debe tener definición breve y acceso a su desglose. No mostrar predicciones en la primera versión como si fueran hechos.

## 11. Rendimiento e índices

Revisar como mínimo índices sobre:

- `AcademicAssignmentReport(periodId, centerDepartmentId, teacherId)`;
- `TeachingSession(assignmentReportId)`;
- `CourseClassroom(teachingSessionId, courseId, classroomId)`;
- `ComplementaryActivity(assignmentReportId, activityTypeId)`;
- `ScheduleComplianceCheck(checkDate, courseClassroomId, monitorId)`;
- futuros `CourseSchedule(dayOfWeek, startTime, endTime, courseClassroomId)`.

Validar cada consulta relevante con `EXPLAIN (ANALYZE, BUFFERS)` usando un volumen representativo. No agregar materialized views por anticipado.

Materialized views o tablas precalculadas solo si:

- los endpoints superan el presupuesto acordado de forma consistente;
- existen períodos cerrados consultados repetidamente;
- el volumen crece a cientos de miles/millones de filas;
- la consulta no mejora suficientemente con índices y SQL adecuado.

## 12. Plan de entrega recomendado

### Fase 0 — Definiciones

- Aprobar diccionario de métricas y decisiones pendientes.
- Definir scopes por rol y estado abierto/cerrado del período.
- Confirmar códigos institucionales.

### Fase 1 — Plataforma y métricas disponibles

- Módulo, registry, scope, contratos y dos endpoints esenciales.
- Oferta/carga básica, matrícula/capacidad, personal actual, cobertura tecnológica, actividades básicas y monitoreo actual.
- Ruta `/analytics`, composición por rol y caché largo.

### Fase 2 — Normalización de horarios

- Ejecutar el ADR `CourseSchedule` con compatibilidad y migración.
- Añadir distribución horaria, disponibilidad exacta, horas semanales y ocupación por bloques.

### Fase 3 — Datos semánticos e históricos

- Historial de contrato/categoría/cargos.
- Roles de actividad, actividades emergentes y estados ampliados de monitoreo.
- Uso observado de tecnología, si se aprueba.

### Fase 4 — Optimización y predicción

- Medir consultas y añadir caché servidor/materialized views selectivamente.
- Evaluar predicción solo después de contar con series suficientes, objetivo definido y métricas de error.

## 13. Pruebas y observabilidad

- Unit tests por métrica, incluidos cero, nulos y denominadores vacíos.
- Integration tests contra PostgreSQL para CTE, `DISTINCT`, filtros y scopes.
- Contract tests de dashboard y detalles.
- Pruebas de autorización por rol y carrera.
- Casos que demuestren que varios horarios no duplican una sección.
- Comparación de tarjeta vs total del desglose.
- Métricas de latencia, tasa de caché, filas procesadas y errores por `metricKey`.

## 14. Criterios técnicos de aceptación

1. El dashboard inicial requiere una sola llamada compuesta por conjunto de secciones.
2. Agregar una métrica no exige un endpoint nuevo.
3. Todas las consultas aplican el scope efectivo en backend.
4. Los agregados complejos se ejecutan en PostgreSQL y evitan duplicación.
5. El contrato distingue cero, dato parcial y dato no calculable.
6. TanStack Query usa caché largo para analítica estable y una política distinta para monitoreo en vivo.
7. Los períodos cerrados pueden reutilizar resultados sin recalcular en cada navegación.
8. Las métricas dependientes de horarios no se implementan sobre parsing permanente de `days`/`section`.
9. Los resultados incluyen un desglose auditable.
10. Las nuevas consultas cumplen el presupuesto de rendimiento validado con datos representativos.

## 15. Resultado esperado

La solución queda preparada para crecer de decenas a muchas métricas manteniendo entre dos y cinco endpoints estables. La extensibilidad ocurre dentro del módulo analítico mediante estrategias explícitas, no mediante proliferación de rutas ni consultas arbitrarias desde el cliente. Esto conserva seguridad, claridad del dominio, capacidad de optimización y una experiencia coherente para todos los roles.
