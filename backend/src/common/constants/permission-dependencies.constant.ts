import { DEFAULT_PERMISSIONS, TPermissionSubject } from './permissions.constant';

/**
 * Acción implícita de "lectura de referencia". No es asignable: nunca se
 * siembra en la tabla de permisos ni aparece en la matriz de roles. El backend
 * la deriva al emitir el JWT y el PermissionsGuard solo la acepta en endpoints
 * marcados con @LookupSource().
 *
 * Existe para separar dos cosas que antes eran el mismo permiso:
 *   read:faculties   -> "puedo entrar al módulo Facultades" (menú, ruta, CRUD)
 *   lookup:faculties -> "necesito la lista de facultades para llenar un select"
 */
export const LOOKUP_ACTION = 'lookup' as const;

export type TLookupAction = typeof LOOKUP_ACTION;

/**
 * Módulos cuyo listado puede exponerse como dato de referencia a roles que no
 * los gestionan. Son catálogos (nombres, no información sensible ni
 * transaccional): por eso quedan fuera cursos, reportes, planificaciones,
 * usuarios y actividades, que solo se conceden como permiso real.
 */
export const LOOKUP_SUBJECTS = [
  'faculties',
  'centers',
  'buildings',
  'departments',
  'positions',
  'periods',
  'degrees',
  'classrooms',
  'audio-equipments',
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
  'air-conditioners',
  'pc-equipments',
] as const;

export type TLookupSubject = (typeof LOOKUP_SUBJECTS)[number];

const lookup = (...subjects: TLookupSubject[]) =>
  subjects.map((subject) => `${LOOKUP_ACTION}:${subject}`);

const grant = (
  action: 'manage' | 'read' | 'update',
  ...subjects: TPermissionSubject[]
) => subjects.map((subject) => `${action}:${subject}`);

export const SUBJECT_IMPLIED_PERMISSIONS: Partial<
  Record<TPermissionSubject, readonly string[]>
> = {
  // --- Dependencias de catálogo (selectores de formularios) ---------------
  // Crear/editar un departamento pide seleccionar su facultad.
  departments: lookup('faculties'),
  // Un edificio pertenece a un centro.
  buildings: lookup('centers'),
  // El formulario de aula arma su configuración con edificio, equipo de audio,
  // pizarra digital, condición, conectividad y tipo de aula.
  classrooms: lookup(
    'buildings',
    'audio-equipments',
    'digital-blackboards',
    'conditions',
    'connectivities',
    'room-types',
  ),
  // El formulario de equipo de cómputo selecciona aula, departamento y sus catálogos.
  'pc-equipments': lookup(
    'classrooms',
    'departments',
    'brands',
    'conditions',
    'pc-types',
    'monitor-types',
    'monitor-sizes',
  ),
  // Aire acondicionado y pizarra digital comparten catálogos con inventario.
  'air-conditioners': lookup('classrooms', 'brands', 'conditions'),
  'digital-blackboards': lookup('brands', 'conditions'),
  // Cursos se filtran y crean por departamento, centro y periodo.
  courses: lookup('departments', 'centers', 'periods'),
  // Los títulos se registran contra un periodo académico.
  degrees: lookup('periods'),
  // Alta de usuario: centro, cargo, periodo, títulos y los catálogos laborales.
  users: lookup(
    'centers',
    'positions',
    'periods',
    'degrees',
    'contract-types',
    'shifts',
    'teacher-categories',
  ),
  'user-departments': lookup('centers', 'departments', 'positions'),
  // Los reportes se consultan por departamento y periodo.
  reports: lookup('departments', 'periods'),
  // La planificación asigna aulas dentro de un periodo.
  planifications: lookup('classrooms', 'periods'),

  // --- Vistas compuestas: conceden lo que dejan hacer sus secciones -------
  // Ficha de aula abierta desde un dashboard: solo consulta. Trae los catálogos
  // que muestra la página de detalle (equipamiento, conectividad, inventario).
  'dashboard-tab-classrooms': lookup(
    'classrooms',
    'buildings',
    'room-types',
    'conditions',
    'connectivities',
    'audio-equipments',
    'digital-blackboards',
    'air-conditioners',
    'brands',
    'pc-equipments',
  ),

  // La página Catálogo administra en un solo lugar todas las entidades chicas.
  catalog: grant(
    'manage',
    'teacher-categories',
    'contract-types',
    'shifts',
    'room-types',
    'connectivities',
    'conditions',
    'brands',
    'pc-types',
    'audio-equipments',
    'monitor-types',
    'monitor-sizes',
  ),

  // Pestañas: Planificaciones, Informes, Usuarios, Clases, Periodos, Consolidado.
  'dashboard-authorities': [
    ...grant('manage', 'planifications', 'reports', 'users', 'courses', 'periods'),
    ...lookup('departments'),
  ],
  // Pestañas: Planificaciones, Informes, Usuarios, Clases, Consolidado.
  'dashboard-coordinator': [
    ...grant('manage', 'planifications', 'reports', 'users', 'courses'),
    ...lookup('departments', 'periods'),
  ],
  // Pestañas: Clases asignadas e Informes, ambas acotadas al propio docente.
  // Refleja el alcance del rol DOCENTE sembrado: consulta lo suyo, edita su
  // planificación y gestiona las actividades complementarias del informe.
  'dashboard-teacher': [
    ...grant('read', 'courses', 'reports', 'planifications'),
    ...grant('update', 'planifications'),
    ...grant('manage', 'activities'),
    ...grant('read', 'dashboard-tab-classrooms'),
    ...lookup('periods'),
  ],
  // Checklist de cumplimiento de horarios: el monitor registra y consulta sus
  // verificaciones sobre las aulas y edificios que recorre.
  'dashboard-monitor': [
    ...grant('manage', 'schedule-compliance-check'),
    ...grant('read', 'reports-monitor'),
    ...grant('read', 'dashboard-tab-classrooms'),
    ...lookup('classrooms', 'buildings'),
  ],
};

/**
 * Expande un set de permisos asignados agregando, de forma transitiva, los que
 * cada módulo arrastra, más los que todo usuario tiene por defecto. Los
 * `lookup:` no propagan nada: son una lectura de catálogo, no el permiso de
 * operar el módulo.
 */
export const expandImpliedPermissions = (permissions: string[]): string[] => {
  const expanded = new Set([...permissions, ...DEFAULT_PERMISSIONS]);
  const pending = [...permissions];

  while (pending.length) {
    const permission = pending.pop()!;

    if (permission.startsWith(`${LOOKUP_ACTION}:`)) continue;

    const subject = permission.split(':')[1] as TPermissionSubject;

    for (const implied of SUBJECT_IMPLIED_PERMISSIONS[subject] ?? []) {
      if (expanded.has(implied)) continue;

      expanded.add(implied);
      pending.push(implied);
    }
  }

  return [...expanded];
};
