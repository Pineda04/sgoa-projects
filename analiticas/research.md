# Investigación técnica — Estado actual y viabilidad de Analíticas en SGOA

**Repositorio:** `SGOA-UNAH/sgoa-projects`
**Línea base inspeccionada:** `main`, commit `4a4c48b` (`refactor: relación departamento aula`)
**Fecha de inspección:** 2 de agosto de 2026

## 1. Resumen ejecutivo

El proyecto ya contiene la mayoría de las entidades operacionales necesarias para una primera versión de analíticas: docentes, roles, carreras por centro, períodos, informes de asignación, secciones, matrícula reportada, aulas, capacidad, pizarras, inventario, actividades y chequeos de monitoreo.

No existe todavía un módulo analítico general. Las pantallas actuales funcionan principalmente como CRUD, planificación, informes y dashboards por rol. El único agregado analítico ya implementado de forma explícita es el reporte de monitoreo.

La principal dependencia estructural es el horario: `CourseClassroom.days` y `CourseClassroom.section` son textos. El repositorio contiene el documento `SGOA_PRD_ADR_Normalizacion_Horarios.md`, que propone `CourseSchedule(dayOfWeek, startTime, endTime)`. Las métricas por franja, disponibilidad exacta, horas semanales y utilización de aulas deben depender de ese refactor y no de parsing permanente.

También existen límites de datos que el software no puede resolver solo: no hay matrículas individuales, historial de contrato/categoría, rol del docente en actividades, evidencia de uso real de pizarras ni demanda futura. Estas métricas deben reformularse, ampliar el modelo o declararse no implementables con el estado actual.

## 2. Stack confirmado

| Capa | Estado actual |
|---|---|
| Backend | NestJS 11, TypeScript 5.7, Prisma 7.7, PostgreSQL con múltiples schemas. |
| Frontend | React 19, Vite 7, React Router 7, TanStack Query 5, CASL, Tailwind 4 y componentes shadcn/Radix. |
| Autorización | Roles en backend mediante `@Roles`/`RolesGuard`; CASL y `ProtectedRoute` en frontend. |
| Datos | Prisma sobre schemas `academic`, `auth`, `infraestructure`, `inventory`, `ai` y `public`. |
| Exportación | ExcelJS/XLSX y jsPDF existentes en frontend/backend según flujo. |
| Caché actual | TanStack Query con constantes `STALE_TIME`; no se observó una capa de Redis para analítica. |

## 3. Modelo de datos relevante

### 3.1 Identidad, roles y docentes

- `auth.User`: nombre, código, correo y `activeStatus`.
- `auth.Role` y `auth.UserRole`: un usuario puede tener varios roles.
- `academic.Teacher`: categoría, contrato, jornada y usuario; los atributos de categoría y contrato representan el valor actual.
- `academic.TeacherDepartmentPosition`: docente, cargo, carrera/centro, `startDate` y `endDate`.
- Roles presentes en código: `DIRECCION`, `ADMIN`, `COORDINADOR_AREA`, `DOCENTE`, `RRHH`, `MONITOR`.

Hallazgo: `TeacherDepartmentPosition` tiene `@@unique([teacherId, centerDepartmentId])`. Esto impide conservar más de un nombramiento histórico del mismo docente en la misma carrera, aunque existan fechas. Debe revisarse para analítica histórica de cargos.

### 3.2 Organización académica

- `Center` y `Department` se relacionan mediante `CenterDepartment`.
- `Course` pertenece a `Department` y posee `uvs` y `activeStatus`.
- `AcademicPeriod` posee `year`, `pac`, `pac_modality`, inicio y fin.
- `AcademicAssignmentReport` relaciona docente, período y `CenterDepartment`, con unicidad por los tres.
- `TeachingSession` es uno a uno con el informe.
- `CourseClassroom` representa la sección/asignación: curso, aula, matrícula, modalidad, grupo, días, sección/horario y sesión docente.

La ruta correcta para atribuir una sección a un docente/período/carrera es:

`CourseClassroom → TeachingSession → AcademicAssignmentReport → Teacher / AcademicPeriod / CenterDepartment`.

El `CourseClassroom` ya pertenece a una sola `TeachingSession`; por tanto, no debe asumirse una relación muchos-a-muchos docente-sección en las consultas actuales.

### 3.3 Horarios

En el schema actual:

- `CourseClassroom.days: String`, por ejemplo `LuMaMi`.
- `CourseClassroom.section: String`, documentado como rango `10:00 - 12:00`.

No existe `CourseSchedule`. El frontend y backend interpretan esos strings en distintos flujos. Esto impide consultas relacionales confiables por día/rango y hace frágil la detección de solapamientos.

El ADR existente propone conservar `CourseClassroom` como sección e introducir una entidad hija con un registro por día y rango, usando una migración expand–migrate–contract. Esta propuesta encaja directamente con las necesidades analíticas.

### 3.4 Infraestructura e inventario

- `Classroom`: edificio, capacidad máxima opcional, estado activo, tipo, condición y referencia opcional a `DigitalBlackboard`.
- `Building`: pertenece a un centro.
- `ClassroomDepartment`: relaciona aulas con departamentos y evita duplicados por el par.
- `DigitalBlackboard`, `PcEquipment`, `AirConditioner`, `Condition`, `Brand` y otros catálogos permiten agregaciones de inventario.

La relación actual de pizarra es `Classroom.digitalBlackboardId`; una misma pizarra puede aparecer relacionada con varias aulas según la cardinalidad Prisma. Debe validarse si esto representa un equipo físico único o un tipo/configuración compartida antes de llamar al conteo “número de equipos”. Para “aulas equipadas” basta contar aulas distintas con la referencia no nula.

### 3.5 Matrícula y estadísticas de curso

- `CourseClassroom.studentCount` es obligatorio (`Int`), no nullable en el schema actual.
- `Classroom.maxCapacity` es opcional.
- `CourseStadistic` almacena `APB`, `RPB`, `NSP` y `ABD` por sección, pero sus significados deben documentarse antes de integrarlos a Analíticas.

No existe una tabla de estudiantes ni de matrícula individual. Por tanto, solo se pueden calcular matrículas acumuladas por sección, nunca estudiantes únicos ni demanda por persona.

### 3.6 Actividades

- `ComplementaryActivity`: nombre, registro, expediente, progreso, tipo e informe de asignación.
- `ActivityType`: nombre y descripción; no posee un código estable.
- `VerificationMedia`: descripción y archivos de evidencia.

No existe un campo que indique si el docente fue participante, organizador, coordinador o director. Tampoco hay una bandera semántica estable para “emergente”. Filtrar por texto del nombre sería frágil.

### 3.7 Monitoreo

`ScheduleComplianceCheck` ya almacena:

- sección verificada;
- monitor;
- fecha y hora del chequeo;
- `isPresent` booleano;
- observación;
- `offlineId` y `syncedAt` para operación/sincronización offline;
- restricción única por sección, fecha y hora.

El backend ya expone:

- `GET /monitor/current-assignments`;
- `GET /monitor/buildings`;
- creación y listado de chequeos;
- `GET /monitor/checks/report` con filtros y agrupación.

`MonitorReportsService` carga los chequeos y calcula en memoria totales, presentes, ausentes y cumplimiento; agrupa por día, docente o edificio. Con mayor volumen, debe trasladarse la agregación a PostgreSQL. Además, cuando no hay chequeos devuelve `0` como porcentaje; para el contrato analítico conviene devolver `null` porque no existe denominador.

## 4. Estado actual del frontend

### 4.1 Rutas y dashboards

Existen rutas separadas:

- `/dashboard/authorities`;
- `/dashboard/coordinator` y `/dashboard/coordinator/:centerDepartmentId`;
- `/dashboard/teacher`;
- `/dashboard/monitor`.

`DashboardAuthorities` contiene pestañas de planificaciones, informes, usuarios, clases, períodos y consolidado. `DashboardCoordinator` contiene planificaciones, informes, usuarios, clases y consolidado. `DashboardTeacher` presenta clases asignadas e informes. `DashboardMonitor` presenta checklist y reportes.

No existe todavía una sección transversal de Analíticas. El “Consolidado” no reemplaza el requerimiento, porque no implementa el catálogo completo ni un contrato uniforme de métricas y calidad.

### 4.2 Autorización y navegación

- `AppRouter` protege las rutas mediante `ProtectedRoute` y subjects de CASL.
- `Navbar` ya ofrece accesos a los dashboards según capacidades.
- El backend usa `RolesGuard`, pero los endpoints analíticos necesitarán además limitar filas por usuario, cargo, centro y carrera. El rol por sí solo no define el scope.

### 4.3 TanStack Query

El frontend ya usa query keys por dominio y `STALE_TIME` corto, medio, largo o muy largo. Monitoreo usa `SHORT`, refetch cada minuto para asignaciones actuales y `VERY_LONG` para edificios.

Para Analíticas conviene crear `analyticsKeys` que incluyan explícitamente rol/scope, secciones solicitadas y filtros normalizados. El caché largo es apropiado para períodos cerrados; no debe aplicarse igual a monitoreo del día ni al período abierto.

### 4.4 Ubicación recomendada de Analíticas

Según el codebase, conviene agregar una ruta propia estable:

`/analytics`

y no duplicar toda la UI dentro de cada dashboard. La página puede componer secciones según rol y alcance:

| Rol solicitado | Comportamiento recomendado |
|---|---|
| Docente | Vista personal prefiltrada e inmutable por docente; carga, horarios, matrícula y actividades propias. |
| Coordinador | Vista de sus `CenterDepartment`; permite seleccionar carrera, período, docente y dimensiones relacionadas. |
| Monitor | Vista de monitoreo y contexto operativo autorizado; filtros por fecha, docente, edificio, centro y carrera. |
| Administrador | Acceso a todas las secciones y scopes; puede seleccionar centro/carrera/docente. |

Aunque el transcript se concentra en esos cuatro perfiles, el código también posee Dirección y RR. HH. No deben recibir acceso implícito: producto debe decidir su alcance y registrar esa decisión.

## 5. Matriz depurada de métricas y viabilidad

Clasificaciones:

- **Implementable:** los datos actuales permiten calcularla de forma razonable.
- **Requiere refactor:** depende de una modificación estructural ya identificada.
- **Requiere definición/datos:** necesita una regla institucional, catálogo estable o campo nuevo.
- **No implementable actualmente:** la fuente requerida no existe; debe reformularse o integrarse otra fuente.

| Dominio | Métrica limpia | Clasificación | Fuente/limitación |
|---|---|---|---|
| Oferta | Clases ofertadas por período/carrera | Implementable | `COUNT(DISTINCT CourseClassroom.id)` vía informe/período/carrera. |
| Carga | Secciones por docente, período y año | Implementable | La asignación se deriva de `TeachingSession.assignmentReport.teacherId`. |
| Carga | Asignaturas distintas por docente | Implementable | `COUNT(DISTINCT CourseClassroom.courseId)`. |
| Carga | Historial de clases | Implementable con limitación | Lista por períodos; el horario histórico sigue siendo texto hasta el refactor. |
| Carga | Variación entre períodos | Requiere definición | Implementable cuando se defina qué período es comparable por `pac_modality`. |
| Carga | Promedio de secciones por docente | Requiere definición | Definir si denominador incluye activos, asignados o todos los asociados a carrera. |
| UV | UV por docente/período/año | Requiere definición | `Course.uvs` existe; confirmar duplicación por sección. |
| UV | UV planificadas por carrera | Requiere definición | Mismo punto; técnicamente disponible. |
| Horario | Clases por día/franja y pico | Requiere refactor | Depende de `CourseSchedule`; no sostenerlo en parsing de strings. |
| Horario | Horas semanales por docente | Requiere refactor | Necesita rangos normalizados y regla de duración. |
| Aulas | Disponibilidad exacta por rango | Requiere refactor | Requiere solapamiento sobre horarios estructurados. |
| Aulas | Ocupación de aulas por bloque | Requiere refactor | Igual dependencia. |
| Aulas | Utilización por horas-aula | Requiere refactor y definición | Además requiere horario operativo, calendario y elegibilidad. |
| Matrícula | Matrículas reportadas por sección/carrera | Implementable | Suma de `studentCount`; etiquetar como matrículas. |
| Matrícula | Promedio de matrícula por sección | Implementable | `studentCount` es obligatorio en schema actual. |
| Capacidad | Ocupación, sobrecapacidad y cupos | Implementable con cobertura | `maxCapacity` puede faltar; devolver cobertura/exclusiones. |
| Matrícula | Estudiantes únicos | No implementable actualmente | No hay estudiantes ni matrículas individuales. |
| Docentes | Docentes activos | Implementable | `User.activeStatus` y relación Teacher. Definir scope institucional. |
| Docentes | Distribución actual por contrato/categoría | Implementable | `contractTypeId` y `categoryId`; falta código estable. |
| Docentes | Tiempo completo | Requiere definición/datos | Agregar código estable a `ContractType`, no depender del nombre. |
| Docentes | Historial por contrato/categoría | No implementable actualmente | Los valores actuales se sobrescriben; faltan tablas de vigencia. |
| Cargos | Docentes por cargo vigente | Implementable con limitación | Fechas existen, pero la restricción única limita historial repetido. |
| Carga | Diferencia frente al promedio | Implementable tras reglas UV/denominador | No equivale a sobrecarga contractual. |
| Carga | Sobrecarga docente | No implementable actualmente | Falta carga esperada/umbral por contrato o docente. |
| Tecnología | Aulas con pizarra y cobertura | Implementable | Contar `Classroom` distinto con pizarra y estado activo. |
| Tecnología | Equipos por tipo/condición/edificio | Implementable con validación | Revisar cardinalidad/semántica de pizarra; PCs y A/C son físicos. |
| Tecnología | Equipos operativos | Requiere definición/datos | `Condition` necesita código/clasificación estable. |
| Tecnología | Matrículas en aulas con pizarra | Implementable | Cobertura potencial; deduplicar sección. |
| Tecnología | Uso real de pizarras | No implementable actualmente | No se registra uso observado. |
| Actividades | Actividades por tipo/período/año/carrera/docente | Implementable con limitación | `ActivityType.id` es estable; falta `code` semántico. |
| Actividades | Promedio por docente | Requiere definición | Definir denominador. |
| Actividades | Proyectos organizados/dirigidos | No implementable actualmente | Falta rol del docente en la actividad. |
| Actividades | Actividades emergentes | Requiere definición/datos | Falta definición y código/bandera. |
| Monitoreo | Chequeos, presentes, ausentes, cumplimiento | Implementable; ya existe | Mejorar cálculo DB, denominador cero y permisos/scopes. |
| Monitoreo | Cumplimiento por día/docente/edificio | Implementable; ya existe | Ya se agrupa en memoria. |
| Monitoreo | Cumplimiento por carrera/período | Implementable | Relaciones disponibles; ampliar filtros/agrupaciones. |
| Monitoreo | Estados tardía/cancelada/trasladada | Requiere refactor y definición | `isPresent` booleano no representa esos estados. |
| Predicción | Predicción de oferta/contratación | No es una métrica base | Puede ser fase futura; primero se requieren series históricas y objetivos definidos. |

## 6. Refactors y ampliaciones requeridos antes de métricas dependientes

### 6.1 Normalizar horarios — bloqueo principal

Implementar el ADR existente con `CourseSchedule` por día, hora inicial y final. Migrar creación, edición, importación, disponibilidad, monitoreo, exportaciones y frontend. Añadir detección real de solapamientos y pruebas de paridad. Solo después implementar distribución horaria, disponibilidad, horas semanales y horas-aula.

### 6.2 Códigos semánticos estables

Agregar `code` único o una clasificación equivalente a:

- `ContractType` (`FULL_TIME`, etc.);
- `TeacherCategory`, si las métricas dependen de categorías oficiales;
- `ActivityType` (`RESEARCH`, `COMMUNITY_ENGAGEMENT`, etc.);
- `Condition` o una propiedad `isOperational`.

Los nombres traducibles/editables no deben gobernar reglas analíticas.

### 6.3 Historial laboral

Para estadísticas históricas por período se necesitan entidades de vigencia para contrato y categoría. También debe revisarse la unicidad de `TeacherDepartmentPosition` para permitir períodos sucesivos sin perder historial.

### 6.4 Semántica de actividades

Agregar rol del docente (`PARTICIPANT`, `ORGANIZER`, `COORDINATOR`, `DIRECTOR`) y una clasificación estable para actividades emergentes. Sin esto, no se puede distinguir participación de dirección.

### 6.5 Estados de monitoreo

Si negocio requiere algo más que presencia/ausencia, reemplazar o complementar `isPresent` con un status explícito y definir el denominador. Mantener una migración compatible para chequeos existentes.

### 6.6 Uso real de tecnología

Si se quiere medir utilización y no cobertura potencial, el checklist debe registrar equipo observado/utilizado y posiblemente su condición durante la clase. Sin esta captura, el indicador debe conservar el nombre “matrículas en aulas equipadas”.

### 6.7 Calidad y vigencia de datos

Definir estado abierto/cerrado del período o regla equivalente. Hoy `AcademicPeriod` tiene fechas, pero no un estado explícito. Esto afecta caché prolongado e inmutabilidad histórica.

## 7. Riesgos técnicos

1. **Duplicación por joins:** horarios, actividades y equipos pueden multiplicar secciones y UV. Deduplicar primero.
2. **Histórico falso:** contrato, categoría, condición o pizarra actuales pueden no representar un período pasado.
3. **Scopes incompletos:** `@Roles` no basta para restringir una carrera específica.
4. **Nombres como reglas:** tipos sin códigos estables pueden romper métricas después de una edición.
5. **Caché cruzado:** query keys que omitan usuario/scope pueden reutilizar datos entre vistas incorrectas.
6. **Métricas en memoria:** el patrón actual de monitoreo no escala igual que agregaciones SQL.
7. **Predicción prematura:** una serie histórica limitada no garantiza un modelo útil para contratación.

## 8. Conclusión de investigación

La solución puede comenzar sin data warehouse ni materialized views. PostgreSQL puede calcular bajo demanda la mayoría de los agregados actuales si se usan índices y consultas deduplicadas. La arquitectura debe ser extensible por métricas registradas, pero no exponer un generador de SQL al frontend.

La primera entrega puede incluir oferta, carga, matrícula/capacidad, personal actual, tecnología potencial, actividades básicas y monitoreo existente. Las métricas horarias deben esperar el refactor de `CourseSchedule`; las históricas laborales, uso real, roles de proyecto, estudiantes únicos y sobrecarga requieren nuevas fuentes o modelo.
