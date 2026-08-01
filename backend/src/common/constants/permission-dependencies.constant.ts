import { TPermissionSubject } from './permissions.constant';

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
  // El formulario de aula selecciona edificio y equipo de audio.
  classrooms: lookup('buildings', 'audio-equipments'),
  // El formulario de equipo de cómputo selecciona aula (y su condición) y departamento.
  'pc-equipments': lookup('classrooms', 'departments'),
  // Cursos se filtran y crean por departamento, centro y periodo.
  courses: lookup('departments', 'centers', 'periods'),
  // Los títulos se registran contra un periodo académico.
  degrees: lookup('periods'),
  // Alta de usuario: centro, cargo, periodo y títulos.
  users: lookup('centers', 'positions', 'periods', 'degrees'),
  'user-departments': lookup('centers', 'departments', 'positions'),
  // Los reportes se consultan por departamento y periodo.
  reports: lookup('departments', 'periods'),
  // La planificación asigna aulas dentro de un periodo.
  planifications: lookup('classrooms', 'periods'),

  // --- Vistas compuestas: el dashboard concede lo de sus pestañas ---------
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
    ...lookup('periods'),
  ],
};

/**
 * Expande un set de permisos asignados agregando, de forma transitiva, los que
 * cada módulo arrastra. Los `lookup:` no propagan nada: son una lectura de
 * catálogo, no el permiso de operar el módulo.
 */
export const expandImpliedPermissions = (permissions: string[]): string[] => {
  const expanded = new Set(permissions);
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
