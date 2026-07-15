import { Actions, Subjects } from '@config/lib/casl/ability';

export const ACTION_LABELS: Record<Actions, string> = {
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
