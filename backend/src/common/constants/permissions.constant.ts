// Catálogo cerrado de acciones/módulos para la matriz de permisos.
// Debe mantenerse sincronizado manualmente con
// frontend/src/config/lib/casl/ability.ts (Actions/Subjects).
export const PERMISSION_ACTIONS = [
  'manage',
  'read',
  'create',
  'update',
  'delete',
] as const;

export const PERMISSION_SUBJECTS = [
  // Académico
  'activities',
  'courses',
  'degrees',
  'periods',
  'planifications',
  'reports',
  // Organización
  'centers',
  'departments',
  'faculties',
  'positions',
  // Infraestructura
  'buildings',
  'classrooms',
  // Inventario
  'pc-equipments',
  'audio-equipments',
  'air-conditioners',
  'digital-blackboards',
  'brands',
  'conditions',
  'connectivities',
  'room-types',
  'pc-types',
  'monitor-types',
  'monitor-sizes',
  'contract-types',
  'shifts',
  'teacher-categories',
  // Monitoreo de cumplimiento de horarios
  'schedule-compliance-check',
  'reports-monitor',
  // Usuarios
  'users',
  'user-roles',
  'user-departments',
  'user-status',
  // Vistas
  'dashboard-authorities',
  'dashboard-coordinator',
  'dashboard-teacher',
  'dashboard-monitor',
  // Acceso acotado a la ficha de aula desde un dashboard, sin abrir el módulo
  // Aulas ni mostrarlo en el menú.
  'dashboard-tab-classrooms',
] as const;

export type TPermissionAction = (typeof PERMISSION_ACTIONS)[number];
export type TPermissionSubject = (typeof PERMISSION_SUBJECTS)[number];

/**
 * Pantallas que todo usuario autenticado tiene por definición: inicio, ayuda y
 * su propio perfil. No son asignables (quedan fuera de PERMISSION_SUBJECTS, así
 * que no se siembran ni aparecen en la matriz de roles); el backend las agrega
 * al set de permisos de cada usuario al emitir el JWT.
 */
export const DEFAULT_PERMISSIONS = [
  'manage:home',
  'manage:help',
  'manage:profile',
] as const;

export const NON_ASSIGNABLE_SUBJECTS: readonly TPermissionSubject[] = [
  'dashboard-tab-classrooms',
];
