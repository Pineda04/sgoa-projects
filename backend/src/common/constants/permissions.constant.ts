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
  'activities',
  'buildings',
  'centers',
  'classrooms',
  'courses',
  'degrees',
  'departments',
  'faculties',
  'periods',
  'positions',
  'planifications',
  'reports',
  'pc-equipments',
  'audio-equipments',
  'users',
  'user-departments',
  'user-status',
  'home',
  'help',
  'profile',
  'dashboard-authorities',
  'dashboard-coordinator',
  'dashboard-teacher',
] as const;

export type TPermissionAction = (typeof PERMISSION_ACTIONS)[number];
export type TPermissionSubject = (typeof PERMISSION_SUBJECTS)[number];
