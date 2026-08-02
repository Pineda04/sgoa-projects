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
  // Catálogos: entidades pequeñas que se administran desde la página Catálogo
  'catalog',
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
  'user-departments',
  'user-status',
  // Vistas
  'home',
  'help',
  'profile',
  'dashboard-authorities',
  'dashboard-coordinator',
  'dashboard-teacher',
  'dashboard-monitor',
] as const;

export type TPermissionAction = (typeof PERMISSION_ACTIONS)[number];
export type TPermissionSubject = (typeof PERMISSION_SUBJECTS)[number];
