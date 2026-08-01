import { Actions, AssignableActions, Subjects } from '@config/lib/casl/ability';

/** Etiquetas compactas para listar los permisos implícitos de un módulo. */
export const IMPLIED_ACTION_LABELS: Record<Actions, string> = {
	manage: 'Gestionar',
	read: 'Ver',
	create: 'Crear',
	update: 'Editar',
	delete: 'Eliminar',
	lookup: 'Consultar',
};

export const ACTION_LABELS: Record<AssignableActions, string> = {
	manage: 'Gestionar (todo)',
	read: 'Ver',
	create: 'Crear',
	update: 'Editar',
	delete: 'Eliminar',
};

export const SUBJECT_LABELS: Record<Subjects, string> = {
	all: 'Todo el sistema',
	activities: 'Actividades complementarias',
	buildings: 'Edificios',
	centers: 'Centros',
	classrooms: 'Aulas',
	courses: 'Cursos',
	degrees: 'Títulos',
	departments: 'Departamentos',
	faculties: 'Facultades',
	periods: 'Periodos académicos',
	positions: 'Cargos',
	planifications: 'Planificaciones',
	reports: 'Reportes',
	'pc-equipments': 'Equipos de computación',
	'audio-equipments': 'Equipos de audio',
	users: 'Usuarios',
	'user-departments': 'Departamentos de usuario',
	'user-status': 'Estado de usuario',
	home: 'Inicio',
	help: 'Ayuda',
	profile: 'Perfil',
	'dashboard-authorities': 'Dashboard de autoridades',
	'dashboard-coordinator': 'Dashboard de coordinación',
	'dashboard-teacher': 'Dashboard de docencia',
};
