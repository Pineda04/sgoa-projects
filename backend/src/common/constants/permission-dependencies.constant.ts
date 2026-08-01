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
 * usuarios y actividades, que sí requieren un `read:` explícito en la matriz.
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

/**
 * Dependencias de referencia entre módulos: "para operar <clave> hace falta
 * poder consultar el catálogo de <valores>".
 *
 * Refleja los selectores reales de los formularios del frontend. Al agregar un
 * selector que apunte a otro módulo, hay que registrarlo aquí; de lo contrario
 * un rol con permiso total sobre el módulo no podrá completar el formulario.
 */
export const SUBJECT_LOOKUP_DEPENDENCIES: Partial<
  Record<TPermissionSubject, readonly TLookupSubject[]>
> = {
  // Crear/editar un departamento pide seleccionar su facultad.
  departments: ['faculties'],
  // Un edificio pertenece a un centro.
  buildings: ['centers'],
  // El formulario de aula selecciona edificio y equipo de audio.
  classrooms: ['buildings', 'audio-equipments'],
  // El formulario de equipo de cómputo selecciona aula (y su condición) y departamento.
  'pc-equipments': ['classrooms', 'departments'],
  // Cursos se filtran y crean por departamento, centro y periodo.
  courses: ['departments', 'centers', 'periods'],
  // Los títulos se registran contra un periodo académico.
  degrees: ['periods'],
  // Alta de usuario: centro, cargo, periodo y títulos.
  users: ['centers', 'positions', 'periods', 'degrees'],
  'user-departments': ['centers', 'departments', 'positions'],
  // Los reportes se consultan por departamento y periodo.
  reports: ['departments', 'periods'],
  // La planificación asigna aulas dentro de un periodo.
  planifications: ['classrooms', 'periods'],
};

/**
 * Expande un set de permisos asignados ("action:subject") agregando los
 * "lookup:subject" implícitos. Basta con tener cualquier acción sobre un módulo
 * para obtener la lectura de referencia de sus dependencias.
 */
export const expandWithLookupPermissions = (
  permissions: string[],
): string[] => {
  const expanded = new Set(permissions);

  for (const permission of permissions) {
    const subject = permission.split(':')[1] as TPermissionSubject;
    const dependencies = SUBJECT_LOOKUP_DEPENDENCIES[subject];

    if (!dependencies) continue;

    for (const dependency of dependencies)
      expanded.add(`${LOOKUP_ACTION}:${dependency}`);
  }

  return [...expanded];
};
