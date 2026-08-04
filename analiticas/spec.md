# Especificación funcional — Analíticas académicas SGOA

**Estado:** Borrador para validación de negocio
**Fecha:** 2 de agosto de 2026
**Alcance:** Necesidades de información expresadas en el transcript, sin decisiones de implementación técnica.

## 1. Propósito

SGOA debe incorporar una sección de **Analíticas** que transforme la información ya registrada por planificación académica, informes docentes, infraestructura, inventario y monitoreo en indicadores útiles para docentes, coordinadores, monitores y administradores.

La solución debe permitir consultar el estado actual y el comportamiento histórico por período, semestre/modalidad, año, carrera, docente, aula, edificio y centro, según corresponda. El objetivo no es únicamente mostrar totales: los indicadores deben ayudar a entender la carga docente, la oferta académica, el uso de aulas y tecnología, la matrícula reportada, las actividades docentes y el cumplimiento observado por monitoreo.

Cada indicador debe poder explicarse mediante un desglose. Cuando falten datos, el sistema debe indicarlo claramente en lugar de presentar un cero que pueda interpretarse como un resultado real.

## 2. Transcript mejorado como referencia del requerimiento original

> Se necesita definir qué datos y métricas requieren los distintos usuarios de la aplicación: administrador, monitoreo, docente y coordinador.
>
> Para el coordinador, el sistema debe mostrar toda la oferta académica de la carrera. Debe permitir conocer cuántas clases ha impartido históricamente cada docente, cuántas se le han asignado durante el año y cuántas durante un período específico. También debe mostrar las unidades valorativas asignadas por período, semestre y año, junto con los horarios en que se han impartido las clases.
>
> El coordinador necesita conocer qué aulas están disponibles en cada período, cuántos estudiantes puede recibir una clase y cuántos estudiantes aparecen registrados. El docente debe poder consultar esa misma información, pero únicamente respecto a su propia carga: clases asignadas, horarios, aulas, estudiantes y unidades valorativas.
>
> El usuario de monitoreo debe poder consultar la información general que necesita el coordinador y, además, la información requerida para realizar y analizar las verificaciones de clases.
>
> También se necesita información sobre el equipamiento tecnológico de las aulas. Debe poder conocerse cuáles aulas cuentan con pizarras electrónicas u otros equipos y estimar cuántas matrículas de clases están siendo atendidas en aulas equipadas. Esta información fue solicitada para evaluar el aprovechamiento de las pizarras adquiridas.
>
> Las estadísticas deben consultarse por período, semestre, año, carrera y totales generales. Deben incluir cuántas clases se asignaron por carrera, cuántas unidades valorativas se planificaron y en qué horarios se concentra la mayor parte de las clases. Estos datos deben facilitar el análisis de períodos futuros y servir como insumo para decisiones de planificación y contratación docente.
>
> Se considera útil que el sistema permita asignar recorridos o aulas a los monitores cuando salen a pasar lista. También sería deseable que el monitor pueda utilizar el sistema cuando no tenga conexión a Internet y sincronizar posteriormente la información. Esta capacidad no formaba parte de la solicitud inicial, pero aportaría valor al proceso de monitoreo.
>
> El coordinador también necesita estadísticas de las actividades registradas en los informes de asignación académica: cantidad de docentes de tiempo completo, distribución por categoría, actividades de investigación, vinculación, docencia, innovación tecnológica, diseño curricular y actividades emergentes. También debe conocerse si los docentes han ocupado cargos y cuántos proyectos han organizado o dirigido durante el período o el año.
>
> Gran parte de esta información ya se registra en el informe de asignación académica; la necesidad es consolidarla y presentarla como estadísticas comprensibles para cada usuario.

### Nota sobre fidelidad

El texto anterior conserva la intención completa del transcript, pero corrige errores de transcripción, repeticiones y palabras ambiguas. No agrega reglas de cálculo ni decisiones técnicas. La mención a “semestre” se interpreta como una dimensión temporal que debe validarse frente a la modalidad real del período académico.

## 3. Objetivos de negocio

1. Dar visibilidad de la oferta y carga académica sin consolidaciones manuales.
2. Permitir que cada docente conozca su carga actual e histórica.
3. Apoyar a coordinadores y administración en decisiones de planificación y contratación.
4. Medir la utilización de aulas y la cobertura de equipamiento tecnológico.
5. Consolidar las actividades académicas complementarias registradas por los docentes.
6. Medir el cumplimiento observado mediante monitoreo.
7. Mantener resultados comparables entre períodos y permitir revisar el detalle que origina cada indicador.

## 4. Usuarios y alcance funcional

| Usuario | Alcance esperado |
|---|---|
| Docente | Solo su información: carga, horarios, aulas, matrícula reportada, UV y actividades propias. |
| Coordinador | Información de las carreras o departamentos que coordina, con comparaciones entre docentes y períodos. |
| Monitoreo | Información requerida para verificar clases y analizar cumplimiento; acceso analítico amplio para sus centros autorizados. |
| Administrador | Acceso completo a todas las analíticas, filtros y desgloses. |

La autorización debe reflejar el alcance institucional real. Ocultar una tarjeta no sustituye la protección de sus datos.

## 5. Catálogo funcional de métricas

### 5.1 Oferta y carga académica

| Métrica | Definición de negocio |
|---|---|
| Clases ofertadas | Cantidad de secciones de curso ofrecidas en el alcance seleccionado. |
| Clases asignadas por docente | Cantidad de secciones asignadas a un docente en un período. |
| Clases asignadas durante el año | Total de secciones asignadas al docente en los períodos del año seleccionado. |
| Asignaturas diferentes | Cantidad de asignaturas distintas impartidas, separada del número de secciones. |
| Historial de clases | Relación de asignaciones anteriores con asignatura, sección, período, aula y horario. |
| Variación entre períodos | Cambio absoluto y porcentual de la carga entre el período seleccionado y el período comparable anterior. |
| Promedio de clases por docente | Promedio de secciones impartidas por los docentes incluidos en el alcance. |

Una sección impartida varios días debe seguir siendo una sola clase ofertada. “Tres secciones de dos asignaturas” no debe presentarse como “tres asignaturas”.

### 5.2 Unidades valorativas

| Métrica | Definición de negocio |
|---|---|
| UV por docente y período | Carga de unidades valorativas asignadas al docente durante el período. |
| UV por docente y año | Suma de la carga de UV de los períodos incluidos en el año. |
| UV planificadas por carrera | Carga total de UV ofrecida por una carrera en el alcance seleccionado. |
| Promedio de UV por docente | Promedio de carga de UV entre docentes con asignación. |
| Diferencia respecto al promedio | Diferencia absoluta y porcentual entre la carga del docente y el promedio comparable. |

**Decisión pendiente:** confirmar si dos secciones de la misma asignatura duplican la carga de UV. La recomendación inicial es que sí, porque cada sección representa una asignación docente independiente.

### 5.3 Distribución por horario

| Métrica | Definición de negocio |
|---|---|
| Clases por día | Número de secciones programadas en cada día. |
| Clases por franja horaria | Número de secciones que coinciden total o parcialmente con cada bloque. |
| Horario de mayor concentración | Día y franja con mayor concentración de clases simultáneas. |
| Porcentaje por franja | Participación de cada franja respecto de la programación analizada. |

Una sección con reuniones en varios días puede participar una vez en cada día o franja, pero debe contarse una sola vez en el total de oferta.

### 5.4 Aulas y capacidad

| Métrica | Definición de negocio |
|---|---|
| Aulas disponibles | Aulas activas y elegibles que no están ocupadas durante el día y rango consultados. |
| Aulas ocupadas | Aulas con al menos una clase que coincida con el rango consultado. |
| Ocupación por cantidad de aulas | Proporción de aulas elegibles ocupadas en un bloque. |
| Utilización por horas-aula | Proporción de horas-aula utilizadas respecto de las horas-aula institucionalmente disponibles. |
| Capacidad instalada | Suma de la capacidad máxima registrada en aulas elegibles. |

Para la utilización por horas-aula deben definirse horario operativo, días laborables, feriados, aulas elegibles y vigencia de las asignaciones.

### 5.5 Matrícula reportada

| Métrica | Definición de negocio |
|---|---|
| Matrículas reportadas por sección | Cantidad registrada para una sección. |
| Total de matrículas por carrera | Suma de matrículas reportadas en sus secciones. |
| Promedio por sección | Promedio entre las secciones que poseen información. |
| Ocupación de sección | Relación entre matrícula reportada y capacidad máxima del aula. |
| Secciones sobre capacidad | Secciones cuya matrícula supera la capacidad del aula. |
| Cupos físicos disponibles | Diferencia no negativa entre capacidad y matrícula. |

Estos totales representan **matrículas en secciones**, no estudiantes únicos. Un estudiante inscrito en cinco asignaturas participa cinco veces. El sistema no debe llamarlos “estudiantes únicos”.

### 5.6 Personal docente

| Métrica | Definición de negocio |
|---|---|
| Docentes activos | Docentes habilitados en el alcance seleccionado. |
| Docentes de tiempo completo | Docentes activos con el tipo de contrato institucional correspondiente. |
| Docentes por categoría | Distribución de docentes activos por categoría. |
| Docentes por contrato | Distribución por tipo de contratación. |
| Docentes por cargo vigente | Cantidad de docentes que ocupan cada cargo en la fecha consultada. |
| Porcentaje por contrato/categoría | Participación de cada grupo sobre los docentes considerados. |

### 5.7 Comparación de carga docente

Cada docente debe poder compararse mediante número de secciones, asignaturas diferentes, UV y, cuando el horario esté estructurado, horas semanales. Una posible sobrecarga no debe declararse únicamente por estar encima del promedio: para ello debe existir una carga contractual esperada o un umbral institucional validado.

### 5.8 Equipamiento tecnológico

| Métrica | Definición de negocio |
|---|---|
| Aulas con pizarra electrónica | Aulas distintas que cuentan con al menos una pizarra registrada. |
| Cobertura de pizarras | Porcentaje de aulas activas con pizarra electrónica. |
| Equipos por tipo/condición/edificio | Distribución del inventario físico según sus atributos. |
| Equipos operativos | Equipos cuya condición institucional se clasifique como operativa. |
| Matrículas atendidas en aulas con pizarra | Matrículas de secciones asignadas a aulas equipadas. |

La última métrica no prueba uso efectivo de la pizarra. Debe presentarse como **exposición o cobertura potencial**, salvo que se capture explícitamente el uso observado.

### 5.9 Actividades docentes

| Métrica | Definición de negocio |
|---|---|
| Actividades totales | Cantidad de actividades registradas en informes académicos. |
| Actividades por tipo | Distribución por investigación, vinculación, innovación, diseño curricular u otros tipos institucionales. |
| Actividades por período/año/carrera | Totales dentro de cada dimensión. |
| Promedio por docente | Actividades totales entre los docentes incluidos en el denominador definido. |
| Proyectos organizados o dirigidos | Proyectos en los que el docente desempeñó un rol de organización o dirección. |
| Actividades emergentes | Actividades clasificadas institucionalmente como emergentes. |

**Decisiones pendientes:** definir el denominador del promedio; confirmar el catálogo de tipos; registrar el rol del docente para distinguir participación de organización o dirección.

### 5.10 Monitoreo

| Métrica | Definición de negocio |
|---|---|
| Chequeos realizados | Total de verificaciones registradas. |
| Presencias confirmadas | Chequeos en los que la clase fue encontrada en curso. |
| Ausencias registradas | Chequeos en los que la clase no fue encontrada. |
| Porcentaje de cumplimiento | Presencias confirmadas respecto de chequeos válidos. |
| Cumplimiento por docente/carrera/período/edificio/día | La misma relación agrupada o filtrada por la dimensión indicada. |

El porcentaje actual mide presencia confirmada durante un chequeo, no la impartición completa de la clase. Si se incorporan estados como tardía, cancelada, trasladada o no encontrada, debe acordarse cuáles pertenecen al denominador.

## 6. Funcionalidades relacionadas que no son métricas

- Asignar edificios, aulas o recorridos a monitores.
- Operar el checklist sin Internet y sincronizar después.
- Consultar el detalle que respalda cada indicador.
- Exportar resultados.
- Usar información histórica como insumo para predicción o contratación.

Estas capacidades pueden apoyar la analítica, pero no deben registrarse como indicadores numéricos.

## 7. Reglas transversales

1. Todas las métricas deben usar filtros y alcances de usuario consistentes.
2. Una sección no debe duplicarse por tener varios días, horarios, actividades o equipos relacionados.
3. Los valores desconocidos deben mostrarse como “sin información”.
4. Un porcentaje sin denominador válido debe mostrarse como no calculable, no como `0 %`.
5. Los registros inactivos, anulados o fuera de vigencia deben tratarse mediante reglas explícitas.
6. Cada indicador debe ofrecer un desglose auditable.
7. Los datos históricos deben reflejar el estado que correspondía al período, no atributos actuales sobrescritos.
8. Debe mostrarse la cobertura o calidad del dato cuando el resultado dependa de campos incompletos.

## 8. Criterios de aceptación funcionales

- Docente, coordinador, monitor y administrador visualizan únicamente el alcance autorizado.
- El total de clases no cambia por añadir varios horarios a una sección.
- Las métricas históricas pueden filtrarse por período y año.
- Los indicadores de carrera y docente usan el mismo universo de datos que su desglose.
- Las matrículas se etiquetan correctamente y no se presentan como estudiantes únicos.
- La cobertura potencial de pizarras no se presenta como uso real.
- Las métricas no calculables indican el requisito o dato faltante.
- Los responsables de negocio validan las decisiones pendientes antes de publicar indicadores afectados.

## 9. Decisiones de negocio pendientes

1. Regla institucional de UV para varias secciones de una misma asignatura.
2. Significado exacto de “semestre” frente a PAC y modalidad.
3. Denominador del promedio de actividades docentes.
4. Códigos oficiales para tipos de contrato, categorías, condiciones y actividades.
5. Horario operativo, días laborables y excepciones para utilización de aulas.
6. Definición institucional de sobrecarga docente.
7. Estados válidos de monitoreo y composición del porcentaje de cumplimiento.
8. Definición de actividad emergente y roles de dirección/organización.
