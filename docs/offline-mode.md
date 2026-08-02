# Modo Offline del Monitor (Frontend)

> Documentación técnica del modo offline implementado en el frontend para el rol **MONITOR**: login sin conexión, dashboard con datos cacheados y registro/sincronización de asistencias sin internet.

## Resumen

El monitor puede trabajar sin conexión a internet en el flujo diario de verificación de asistencias. La app:

1. Guarda las credenciales **cifradas** localmente para permitir el **login offline**.
2. Cachea las asignaciones del día y el período académico vigente en **IndexedDB (Dexie)**, sobreescribiéndolos en cada petición exitosa.
3. Registra las verificaciones de asistencia **localmente** (`offlineChecks`) y las **sincroniza** en lote al recuperar la conexión.
4. Conserva el estado registrado aunque se navegue entre páginas, evitando registros duplicados.

El caché de datos es **por email**: cada monitor tiene su propia fila, de modo que varios monitores en el mismo dispositivo no mezclan información.

## Alcance

| Flujo | Online | Offline |
| --- | --- | --- |
| Login | Credenciales contra el backend; se guardan cifradas para futuro uso offline | Validación contra credenciales locales (solo rol `MONITOR`) |
| Asignaciones del día | `GET /monitor/current-assignments`; se escribe en Dexie | Lectura desde Dexie (`monitorAssignments`) |
| Período vigente | `GET /academic-periods/current`; se escribe en Dexie | Lectura desde Dexie (`academicPeriods`) |
| Registro de asistencia | Guardado local + sync en lote | Guardado local (`offlineChecks`) con estado reflejado en la UI |
| Sincronización | — | En lote al reconectar (`POST /monitor/checks/batch-sync`) |

> **Fuera de alcance:** la pestaña de Reportes del monitor no es offline (usa `GET /monitor/checks/report`). El nombre/código del header del dashboard provienen de `GET /teachers/current` y pueden no cargar sin conexión.

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

### Tablas

**`offlineChecks`** — verificaciones de asistencia registradas localmente. Índices: `offlineId, courseClassroomId, checkDate, checkTime, syncStatus`.

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `offlineId` | string | UUID generado en el frontend (`crypto.randomUUID()`) |
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

La contraseña **nunca se guarda en texto plano**. Al loguear online se deriva una clave PBKDF2 (150,000 iteraciones, SHA-256) y se cifra el access token con **AES-GCM (256 bits)**:

```
password ──PBKDF2(150k, SHA-256)──▶ clave AES-GCM
                    │
                    ├──▶ hash de verificación (deriveBits, 256 bits)
                    └──▶ encrypt(token) ──▶ encryptedToken
```

- `saveCredentials({ email, password, accessToken })`: guarda la fila cifrada.
- `verifyCredentials({ email, password })`: re-deriva la clave, compara el hash (tiempo constante) y descifra el token.
- `crypto.subtle` solo existe en **contextos seguros** (localhost/HTTPS); si no está disponible se degrada sin romper (no se guarda ni se verifica localmente).

### Flujo de login

1. **Online**: `POST /auth/local/signin` → en segundo plano se guardan las credenciales cifradas y se limpia la caché de otros monitores (`clearOtherMonitorsCache`).
2. **Offline** (`!navigator.onLine`): se valida contra las credenciales locales. Si son válidas y el token es de rol `MONITOR`, se construye una sesión local (`buildLocalSessionResponse`) y se continúa sin red. Si no, se muestra el mensaje *"Sin conexión: no hay credenciales guardadas válidas..."*.
3. **Fallo de red con "red" aparente** (`ERR_NETWORK`): se intenta la validación local antes de mostrar el error.
4. `networkMode: 'always'` en `useLogin` hace que el login **falle rápido** (error de red) en lugar de quedarse pausado con el Loading infinito (`networkMode 'online'` pausa la mutación sin internet).
5. En `checkSessionToken`, si el monitor está offline se omite el refresh del token y se usa el token cacheado.

## Caché de datos del dashboard

Archivos: `frontend/src/config/lib/db/monitor-cache.ts`, `frontend/src/api/monitor/useMonitorQueries.ts`, `frontend/src/api/periods/usePeriodsQueries.ts`, hooks en `frontend/src/shared/hooks/`.

### Escritura (sobreescritura en cada fetch exitoso)

- `useGetCurrentAssignments({ enabled, email })` y `useGetCurrentAcademicPeriod({ enabled, email })` aceptan opciones; tras una respuesta exitosa **sobreescriben** la fila de Dexie del email (`saveCurrentAssignments` / `saveCurrentAcademicPeriod`).
- Quienes llaman sin opciones (Home, reportes, etc.) se comportan igual que antes y no escriben en Dexie (sin `email` no aplica).
- Incluye el refetch automático de 60s de `current-assignments`, por lo que la caché se mantiene al día mientras el monitor usa la app.

### Lectura (offline sin llamar al backend)

| Hook | Uso |
| --- | --- |
| `useIsOnline()` | Estado reactivo de `navigator.onLine` (eventos `online`/`offline`) |
| `useCachedAssignments(email)` | `useLiveQuery` → asignaciones cacheadas (default `[]`) |
| `useCachedAcademicPeriod(email)` | `useLiveQuery` → período vigente cacheado (default `null`) |

- **`DashboardMonitor`**: `periodTitle = isOnline ? data?.title : cached?.title`. La query del período se deshabilita offline (`enabled: isOnline`).
- **`MonitorChecklist`**: `sourceData = isOnline ? data : cachedAssignments`. El email de sesión (del JWT) se usa como clave; está disponible incluso sin red.
- El `refetchInterval` de `current-assignments` devuelve `false` cuando la query está deshabilitada u offline.

## Registro de asistencias offline y sincronización

Archivos: `frontend/src/features/dashboard/components/monitor-checklist/useRegisterCheck.ts`, `useOfflineChecksToday.ts`, `frontend/src/shared/hooks/useSyncEngine.ts`, `frontend/src/features/dashboard/components/SyncIndicator.tsx`, backend `monitor-checks.*`.

### Registro local

- `registerCheck` genera un `offlineId`, guarda la fila `PENDING` en `offlineChecks` y refleja el estado en la UI al instante (override en memoria).
- **Guard anti-duplicado**: si ya existe un registro local para el mismo `(courseClassroomId, checkDate)`, no crea otro (evita dos asistencias del mismo día al sincronizar).
- **`useOfflineChecksToday`**: expone los registros locales del día (Dexie) como overrides **durables**. Esto resuelve el caso de desmontaje (navegar a otra página y volver): el estado registrado persiste aunque los overrides en memoria se pierdan, y no parece "pendiente" para re-registrarlo.
- Precedencia del estado mostrado: override en memoria (recién registrado) → registro local del día (Dexie) → check del servidor/caché.

### Sincronización

- `useSyncEngine` observa la red y los pendientes:
  1. Con pendientes y online, envía el lote a `POST /monitor/checks/batch-sync`.
  2. Si responde OK, marca los registros como `SYNCED` y **invalida** la query de asignaciones para refrescarlas desde el servidor.
- Backend (`MonitorChecksService.batchSync`): procesa cada check con `upsert` sobre `courseClassroomId + checkDate + checkTime`, devolviendo `{ synced, skipped }` (los ya existentes solo actualizan `syncedAt`).
- `SyncIndicator` muestra el estado: `SYNCED` / `OFFLINE` / `SYNCING`.

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

```
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
                    │               └─▶ invalidar asignaciones    │
                    └─────────────────────────────────────────────┘
```

## Guía de pruebas manuales

Preparación: backend y `npm run dev` corriendo, IndexedDB vacío. **No usar el botón de refrescar del navegador** (en dev no hay service worker); navegar solo por la UI.

1. **Login online + llenado de caché**
   - Ingresar con un monitor → el checklist muestra las clases del día.
   - DevTools → Application → IndexedDB → `SGOALocalDB`: `credentials`, `monitorAssignments` y `academicPeriods` con la fila del email y `fetchedAt`.

2. **Login offline**
   - Network → Offline → cerrar sesión → re-ingresar las mismas credenciales → login OK.
   - En Network no debe aparecer `current-assignments` ni `academic-periods/current`.
   - El dashboard muestra las mismas asignaciones y el título del período desde Dexie.

3. **Registro offline y persistencia**
   - Registrar presencia/ausencia en 2-3 clases → la UI refleja "Verificado a las HH:MM".
   - Navegar a otra página y volver al checklist → los registros **siguen visibles** (no vuelven a aparecer como pendientes).
   - Doble click rápido en Presente/Ausente → solo 1 fila por `(courseClassroomId, checkDate)` en `offlineChecks`.

4. **Sincronización**
   - Network → Online → `SyncIndicator` pasa por SYNCING → SYNCED; las filas quedan `SYNCED`.
   - Las asistencias aparecen en el backend y las asignaciones se refrescan (nueva `fetchedAt`).

5. **Logout con pendientes**
   - Registrar un check offline y cerrar sesión → confirm "Tienes X reporte(s) sin sincronizar...".
   - Cancelar permanece en el dashboard; confirmar limpia `offlineChecks`. `credentials`, `monitorAssignments` y `academicPeriods` **persisten**.

6. **Multi-monitor (mismo dispositivo)**
   - Loguear con otro email → `clearOtherMonitorsCache` elimina las filas del monitor anterior.

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
