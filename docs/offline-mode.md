# Modo Offline del Monitor (Frontend)

> Documentación técnica del modo offline implementado en el frontend para el rol **MONITOR**: login sin conexión, dashboard con datos cacheados y registro/sincronización de asistencias sin internet.

## Resumen

El monitor puede trabajar sin conexión a internet en el flujo diario de verificación de asistencias. La app:

1. Guarda las credenciales **cifradas** localmente para permitir el **login offline**.
2. Cachea las asignaciones del día y el período académico vigente en **IndexedDB (Dexie)**, sobreescribiéndolos en cada petición exitosa.
3. Registra las verificaciones de asistencia **localmente** (`offlineChecks`) y las **sincroniza** en lote al recuperar la conexión.
4. Conserva el estado registrado aunque se navegue entre páginas, evitando registros duplicados.

El caché de datos es **por email**: cada monitor tiene su propia fila, de modo que varios monitores en el mismo dispositivo no mezclan información. Los registros de asistencia offline (`offlineChecks`) también se etiquetan con el email del monitor y solo se leen/sincronizan los del usuario activo.

## Alcance

| Flujo | Online | Offline |
| --- | --- | --- |
| Login | Credenciales contra el backend; se guardan cifradas para futuro uso offline | Validación contra credenciales locales (solo rol `MONITOR`) |
| Asignaciones del día | `GET /monitor/current-assignments`; se escribe en Dexie | Lectura desde Dexie (`monitorAssignments`) |
| Período vigente | `GET /academic-periods/current`; se escribe en Dexie | Lectura desde Dexie (`academicPeriods`) |
| Registro de asistencia | Guardado local + sync en lote | Guardado local (`offlineChecks`) con estado reflejado en la UI |
| Sincronización | — | En lote al reconectar (`POST /monitor/checks/batch-sync`) |

> **Fuera de alcance:** la pestaña de Reportes del monitor no es offline (usa `GET /monitor/checks/report`). El nombre/código del header del dashboard provienen de `GET /teachers/current`; sin conexión **no se muestran** (el email sí, siempre desde el JWT de la sesión).

## Dependencias

| Librería | Versión | Uso |
| --- | --- | --- |
| `dexie` | ^4.4.4 | Base de datos local sobre IndexedDB (`SGOALocalDB`) |
| `dexie-react-hooks` | ^4.4.0 | Hooks reactivos sobre Dexie (`useLiveQuery`) |
| `idb-keyval` | ^6.3.0 | Persistencia del caché de TanStack Query (pares clave-valor) |
| `vite-plugin-pwa` | ^1.3.0 | Service Worker / precache del app shell (PWA) |

## Base de datos local (Dexie / IndexedDB)

Base: **`SGOALocalDB`**, con versionado incremental:

| Versión | Cambio |
| --- | --- |
| v1 | Tabla `offlineChecks` (registros de asistencia locales) |
| v2 | Tabla `credentials` (credenciales cifradas para login offline) |
| v3 | Tablas `monitorAssignments` y `academicPeriods` (caché por email) |
| v4 | `offlineChecks` aislado por email del monitor (índices `[email+checkDate]`, `[email+syncStatus]`) |
| v5 | Las filas heredadas sin email se conservan en cuarentena (`QUARANTINED`); solo soporte técnico puede eliminarlas explícitamente |

### Tablas

**`offlineChecks`** — verificaciones de asistencia registradas localmente. Índices: `offlineId, email, [email+checkDate], [email+syncStatus]`.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `offlineId` | string | UUID generado en el frontend (`crypto.randomUUID()`) |
| `email` | string | Email del monitor dueño (normalizado a minúsculas) |
| `courseClassroomId` | string | Id de la sección de asignatura verificada |
| `checkDate` | string | Fecha en formato `YYYY-MM-DD` |
| `checkTime` | string | Hora en formato `HH:MM` |
| `isPresent` | boolean | Presente / ausente |
| `observation` | string? | Observación opcional |
| `syncStatus` | `PENDING \| SYNCING \| SYNCED \| ERROR` | Estado de sincronización |
| `createdAt` | number | Timestamp Unix para orden FIFO |

**`credentials`** — credenciales cifradas para login offline. Clave primaria: `email`.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `email` | string | Email normalizado a minúsculas (PK) |
| `salt` | string (base64) | Salt de 16 bytes usado en PBKDF2 |
| `passwordHash` | string (base64) | Hash de verificación derivado de la contraseña (256 bits) |
| `iv` | string (base64) | IV de AES-GCM (12 bytes) |
| `encryptedToken` | string (base64) | Access token cifrado con AES-GCM |
| `version` | number | Versión del esquema de derivación (actual: `2`); los registros con otra versión se descartan en `verifyCredentials` |
| `updatedAt` | number | Timestamp Unix de la última actualización |

**`monitorAssignments`** — caché de asignaciones del día. Clave primaria: `email`.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `email` | string | Email del monitor (PK) |
| `buildings` | `TMonitorBuildingAssignments[]` | Respuesta de `GET /monitor/current-assignments` |
| `fetchedAt` | number | Timestamp Unix de la última actualización desde el servidor |

**`academicPeriods`** — caché del período académico vigente. Clave primaria: `email`.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `email` | string | Email del usuario (PK) |
| `period` | `TCurrentAcademicPeriod` | Respuesta de `GET /academic-periods/current` |
| `fetchedAt` | number | Timestamp Unix de la última actualización desde el servidor |

## Autenticación offline

Archivos: `frontend/src/config/lib/db/auth-credentials.ts`, `frontend/src/config/providers/auth/AuthProvider.tsx`, `frontend/src/api/auth/useAuthMutations.ts`.

### Cifrado de credenciales

La contraseña **nunca se guarda en texto plano**. Al loguear online se deriva un **material maestro** con PBKDF2 (600,000 iteraciones, SHA-256) y, desde ese material, dos subclaves independientes mediante **HKDF-SHA256** con `info` distintos: la clave **AES-GCM (256 bits)** de cifrado y el **hash de verificación**. La separación de dominios garantiza que el hash almacenado no sirva para descifrar el token.

```text
password ──PBKDF2(600k, SHA-256)──▶ material maestro (256 bits)
                     │
                     ├──HKDF(info: offline.aes)──────▶ clave AES-GCM ──▶ encrypt(token)
                     └──HKDF(info: offline.verify)────▶ hash de verificación (256 bits)
```

- `saveCredentials({ email, password, accessToken })`: guarda la fila cifrada con `version: 2`.
- `verifyCredentials({ email, password })`: re-deriva el material, compara el hash (tiempo constante) y descifra el token.
- **Migración**: los registros con `version` distinta a la actual no son legibles y se **descartan** en `verifyCredentials`; se re-guardan en el próximo login online.
- `crypto.subtle` solo existe en **contextos seguros** (localhost/HTTPS); si no está disponible se degrada sin romper (no se guarda ni se verifica localmente).

### Flujo de login

1. **Online**: `POST /auth/local/signin` → en segundo plano se guardan las credenciales cifradas (con `version: 2`), se limpia únicamente la caché renovable de asignaciones/períodos de otros monitores (`clearOtherMonitorsCache`) y se aplica la **retención** de checks sincronizados propios (`cleanupSyncedChecks`, borra SYNCED con más de 7 días).
2. **Offline** (`!navigator.onLine`): se valida contra las credenciales locales. Si son válidas y el token es de rol `MONITOR`, se construye una sesión local (`buildLocalSessionResponse`) y se continúa sin red. Si no, se muestra el mensaje *"Sin conexión: no hay credenciales guardadas válidas..."*.
3. **Fallo de red con "red" aparente** (`ERR_NETWORK`): se intenta la validación local antes de mostrar el error.
4. `networkMode: 'always'` en `useLogin` hace que el login **falle rápido** (error de red) en lugar de quedarse pausado con el Loading infinito (`networkMode 'online'` pausa la mutación sin internet).
5. En `checkSessionToken`, si el monitor está offline se omite el refresh del token y se usa el token cacheado.

## Caché de datos del dashboard

Archivos: `frontend/src/config/lib/db/monitor-cache.ts`, `frontend/src/api/monitor/useMonitorQueries.ts`, `frontend/src/api/periods/usePeriodsQueries.ts`, hooks en `frontend/src/shared/hooks/`.

### Escritura (sobreescritura en cada fetch exitoso)

- `useGetCurrentAssignments({ enabled, email })` y `useGetCurrentAcademicPeriod({ enabled, email })` aceptan opciones; tras una respuesta exitosa **sobreescriben** la fila de Dexie del email (`saveCurrentAssignments` / `saveCurrentAcademicPeriod`).
- Si no se pasa `email`, los hooks lo derivan de la sesión (`useAuth().authState.user?.email`), de modo que la caché se escribe para el usuario activo incluso en quienes llaman sin opciones (Home, reportes, etc.).
- Incluye el refetch automático de 60s de `current-assignments`, por lo que la caché se mantiene al día mientras el monitor usa la app.

### Lectura (offline sin llamar al backend)

| Hook | Uso |
| --- | --- |
| `useIsOnline()` | Estado reactivo de `navigator.onLine` (eventos `online`/`offline`) |
| `useCachedAssignments(email)` | `useLiveQuery` → asignaciones cacheadas (default `[]`) |
| `useCachedAcademicPeriod(email)` | `useLiveQuery` → período vigente cacheado (default `null`) |

- **`DashboardMonitor`**: `periodTitle = data?.title ?? cached?.title` (**fallback encadenado**). La query del período se deshabilita offline (`enabled: isOnline`).
- **`MonitorChecklist`**: `sourceData = data ?? cachedAssignments` (**fallback encadenado**). El email de sesión (del JWT) se usa como clave; está disponible incluso sin red.
- El fallback encadenado conserva los datos ya cargados durante la transición de red: si la fuente nueva (fetch remoto o lectura asíncrona de Dexie) aún no se resolvió, la interfaz no retrocede a un estado vacío.
- El `refetchInterval` de `current-assignments` devuelve `false` cuando la query está deshabilitada u offline.

## Registro de asistencias offline y sincronización

Archivos: `frontend/src/features/dashboard/components/monitor-checklist/useRegisterCheck.ts`, `useOfflineChecksToday.ts`, `frontend/src/shared/hooks/useSyncEngine.ts`, `frontend/src/features/dashboard/components/SyncIndicator.tsx`, backend `monitor-checks.*`.

### Registro local

- `registerCheck` genera un `offlineId` y guarda la fila `PENDING` en `offlineChecks` (etiquetada con el email del monitor). La lectura anti-duplicado y la escritura se hacen dentro de una **transacción Dexie**, de modo que dos llamadas concurrentes no inserten dos registros.
- **Guard anti-duplicado**: si ya existe un registro local del mismo monitor para el mismo `(courseClassroomId, checkDate)`, no crea otro (evita dos asistencias del mismo día al sincronizar).
- **Corrección de un PENDING**: si el registro existente aún está `PENDING`, se **actualiza** (`isPresent`, `checkTime`, `observation`) en lugar de descartar la corrección del usuario. Si ya está `SYNCED` no se toca (el servidor conserva la versión enviada).
- **`useOfflineChecksToday(email)`** es la **fuente única** del estado registrado en la UI: expone de forma reactiva (`useLiveQuery`) los registros locales del día del monitor. Reacciona a cada `add`/`update`/`delete` y sobrevive a los desmontajes (navegar a otra página y volver), sin copias en memoria que puedan quedar obsoletas.

### Sincronización

- `useSyncEngine(email)` observa la red y los pendientes **del monitor actual** (solo `PENDING` con su email):
  1. Con pendientes y online, envía el lote a `POST /monitor/checks/batch-sync`. Un cerrojo síncrono (`isSyncingRef`) impide que dos sincronizaciones concurrentes envíen el mismo lote cuando `useLiveQuery` emite antes de que React re-renderice.
  2. Con la respuesta `{ synced, conflicts, skipped, conflictIds, skippedIds }` marca `SYNCED` **solo los registros realmente persistidos**. Los **conflictos** (otro monitor ya verificó esa clave) se eliminan localmente y los `skipped` (error inesperado) se conservan `PENDING` para reintentar.
  3. Aplica la **retención**: borra los registros `SYNCED` con más de 7 días de antigüedad (`cleanupSyncedChecks`).
  4. Invalida la query de asignaciones para refrescarlas desde el servidor.
  5. Si el lote falla, el estado pasa a `ERROR` (las filas siguen `PENDING`) y se reintenta manualmente o al reconectar.
- Backend (`MonitorChecksService.batchSync`): resuelve atómicamente por `courseClassroomId + checkDate`, en lotes de 25. Actualiza la hora, presencia y observación solo si el registro pertenece al mismo monitor; si pertenece a otro devuelve conflicto sin sobrescribirlo. La respuesta incluye `conflictIds`, `rejectedIds` (errores permanentes, como una sección inexistente) y `skippedIds` (errores transitorios).
- El cliente conserva `CONFLICT` y `REJECTED` con su motivo en una lista revisable del checklist; solo se eliminan cuando el monitor los descarta explícitamente. Las filas `QUARANTINED` no se leen ni sincronizan y se atienden por soporte técnico.
- `SyncIndicator` muestra el estado: `SYNCED` / `OFFLINE` / `SYNCING` / `ERROR` (con botón de reintento). Sus contenedores son regiones vivas (`role="status"` + `aria-live="polite"`) para anunciar los cambios de estado a lectores de pantalla.
- La **retención** también se aplica al iniciar sesión como monitor (online y offline-restaurado); el histórico definitivo vive en el backend.

## TanStack Query

Archivo: `frontend/src/config/lib/tanstack/query-client.ts`.

- Persistencia de queries en IndexedDB vía `idb-keyval` (`persistQueryClient`) con `maxAge` de **24 horas**; `gcTime` de 24h.
- `networkMode: 'offlineFirst'`: intenta servir el caché antes de fallar por falta de red.
- Handlers globales de error (`error-handler.ts`) con guard para respuestas `undefined` en errores de red (evita mensajes rotos en los toasts).

> Dexie se usa para las **tablas de negocio** (`offlineChecks`, `credentials`, cachés por email), e `idb-keyval` para el **caché de queries** de TanStack Query. Ambos coexisten sin pisarse.

## PWA / Service Worker (`vite-plugin-pwa`)

Archivo: `frontend/vite.config.ts`.

- `registerType: 'autoUpdate'` con precache del app shell (`globPatterns: **/*.{js,css,html,ico,png,svg,woff,woff2}`).
- `navigateFallback: 'index.html'` (por defecto del plugin): recargar una ruta SPA (`/login`, `/dashboard/monitor`) sin red sirve el `index.html` precacheado.
- Manifest con nombre/theme de la app.

### Comportamiento y limitaciones

- **Solo aplica al build de producción** (`npm run build` + servir el `dist`). En `npm run dev` el service worker está **desactivado por defecto**; recargar sin red en dev falla con `ERR_INTERNET_DISCONNECTED` (es comportamiento esperado, no un bug).
- Requiere **HTTPS o localhost** (secure context).
- Se instala tras una **primera visita online**; en un dispositivo sin visitas previas el primer refresh offline fallará.
- Los **datos** (asignaciones, período, credenciales, checks) viven en IndexedDB y sobreviven al reload; el **código** de la app solo sobrevive al reload si el service worker está instalado (producción).

## Flujo offline → online

```text
                    ┌─────────────────────────────────────────────┐
                    │                 Frontend                    │
                    │                                             │
   Online ─────────▶│  login ─▶ saveCredentials (cifrado)         │
                    │          fetch asignaciones/período ──▶ Dexie│
                    │          registerCheck ──▶ offlineChecks    │
                    │                                             │
   Offline ────────▶│  login ─▶ verifyCredentials (Dexie)         │
                    │  dashboard ─▶ leer monitorAssignments/      │
                    │              academicPeriods (Dexie)        │
                    │  registerCheck ──▶ offlineChecks (PENDING)  │
                    │                                             │
   Reconexión ─────▶│  useSyncEngine ─▶ POST batch-sync ──▶ SYNCED│
                   │               └─▶ conflictos: revisión local │
                    │               └─▶ fallo: ERROR (reintento)  │
                    └─────────────────────────────────────────────┘
```

## Guía de pruebas manuales

Preparación: backend y `npm run dev` corriendo, IndexedDB vacío. **No usar el botón de refrescar del navegador** (en dev no hay service worker); navegar solo por la UI. No existen pruebas automatizadas del módulo monitor: la verificación es manual, vía DevTools (Network, Application → IndexedDB → `SGOALocalDB`) y el backend.

1. **Login online + llenado de caché**
   - Ingresar con un monitor → el checklist muestra las clases del día.
   - DevTools → Application → IndexedDB → `SGOALocalDB`: `credentials`, `monitorAssignments` y `academicPeriods` con la fila del email y `fetchedAt`.

2. **Login offline**
   - Network → Offline → cerrar sesión → re-ingresar las mismas credenciales → login OK.
   - En Network no debe aparecer `current-assignments` ni `academic-periods/current`.
   - El dashboard muestra las mismas asignaciones y el título del período desde Dexie.
   - El header del dashboard **oculta** nombre y código (dependen de `GET /teachers/current`, sin red no cargan) y muestra el **email** (desde el JWT).

3. **Registro offline y persistencia**
   - Registrar presencia/ausencia en 2-3 clases → la UI refleja "Verificado a las HH:MM".
   - Navegar a otra página y volver al checklist → los registros **siguen visibles** (no vuelven a aparecer como pendientes).
   - Doble click rápido en Presente/Ausente → solo 1 fila por `(courseClassroomId, checkDate)` en `offlineChecks`, garantizada por la transacción y el guard anti-duplicado. El cerrojo de sync se prueba por separado y solo evita envíos concurrentes.

4. **Corrección de un registro pendiente**
   - Registrar una verificación en una clase.
   - Volver a verificar la **misma** clase con el valor contrario y una observación.
   - DevTools → IndexedDB: sigue habiendo **una sola fila** (mismo `offlineId`) y su `isPresent`/`observation` se actualizaron (la corrección no se descarta).
   - Tras sincronizar (paso 5), el backend guarda la **última** corrección, no dos asistencias.

5. **Sincronización**
   - Network → Online → `SyncIndicator` pasa por SYNCING → SYNCED; las filas quedan `SYNCED`.
   - Las asistencias aparecen en el backend y las asignaciones se refrescan (nueva `fetchedAt`).
   - Registrar otra verificación offline y volver a reconectar → se sincroniza en lote sin duplicar las ya enviadas.

6. **Error y reintento**
   - Registrar checks offline y **detener el backend** (o bloquear `POST /monitor/checks/batch-sync`) con la red activa.
   - `SyncIndicator` pasa a **ERROR** ("Error al sincronizar X registro(s)"); las filas **siguen `PENDING`** en IndexedDB (no se marcan como sincronizadas).
   - Reiniciar el backend → pulsar **Reintentar** → SYNCING → SYNCED; las filas quedan `SYNCED`.

7. **Transición de red (fallback encadenado)**
   - Estando en el checklist con asignaciones cargadas, alternar Network → Offline y → Online.
   - En la conmutación, el checklist **no** debe mostrar "No hay asignaciones para el día de hoy" ni el título del período retroceder a "…": se conserva el último dato visible mientras la fuente nueva (fetch remoto o lectura de Dexie) se resuelve.

8. **Logout con pendientes**
   - Registrar un check offline y cerrar sesión → confirm "Tienes X reporte(s) sin sincronizar...".
   - Cancelar permanece en el dashboard; confirmar limpia los `offlineChecks` del usuario. `credentials`, `monitorAssignments` y `academicPeriods` **persisten**.

9. **Multi-monitor (mismo dispositivo)**
   - Loguear con otro email → `clearOtherMonitorsCache` elimina únicamente asignaciones y períodos cacheados de otros monitores; sus `offlineChecks` permanecen aislados por email.
   - Registrar checks offline con el monitor A, cerrar sesión y loguear con el monitor B → el checklist de B **no** muestra los registros de A; al reconectar solo se sincronizan los `PENDING` de B.
   - En IndexedDB, las filas de `offlineChecks` del monitor B tienen su propio `email`.

10. **Retención (política de 7 días)**
    - Tener una fila `SYNCED` en `offlineChecks`.
    - DevTools → IndexedDB → editar su `createdAt` a una fecha de hace más de 7 días.
    - Cerrar sesión y volver a loguear (o forzar una sincronización) → la fila antigua **desaparece**; una fila `SYNCED` reciente se conserva.

11. **Migración de credenciales (esquema `version: 2`)**
    - Con un registro de `credentials` del esquema antiguo (sin `version` o `version` distinta), probar login offline → falla con *"Sin conexión: no hay credenciales guardadas válidas..."* y el registro se **descarta**.
    - Loguear **online** una vez → se re-guarda la fila con `version: 2` → el login offline vuelve a funcionar.

## Archivos clave

| Ámbito | Ruta |
| --- | --- |
| Frontend | `frontend/src/config/lib/db/db.ts` |
| Frontend | `frontend/src/config/lib/db/monitor-cache.ts` |
| Frontend | `frontend/src/config/lib/db/auth-credentials.ts` |
| Frontend | `frontend/src/config/providers/auth/AuthProvider.tsx` |
| Frontend | `frontend/src/shared/hooks/useIsOnline.ts`, `useCachedAssignments.ts`, `useCachedAcademicPeriod.ts`, `useSyncEngine.ts` |
| Frontend | `frontend/src/features/dashboard/components/monitor-checklist/useRegisterCheck.ts`, `useOfflineChecksToday.ts` |
| Frontend | `frontend/src/api/monitor/useMonitorQueries.ts`, `frontend/src/api/periods/usePeriodsQueries.ts` |
| Frontend | `frontend/src/config/lib/tanstack/query-client.ts` |
| Frontend | `frontend/vite.config.ts` |
| Backend | `backend/src/modules/monitor/services/monitor-checks.service.ts` |
| Backend | `backend/src/modules/monitor/controllers/monitor-checks.controller.ts` |
| Backend | `backend/src/modules/monitor/dto/batch-sync-checks.dto.ts` |
