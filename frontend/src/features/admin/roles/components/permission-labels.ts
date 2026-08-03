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
	// Académico
	activities: 'Actividades complementarias',
	courses: 'Cursos',
	degrees: 'Títulos',
	periods: 'Periodos académicos',
	planifications: 'Planificaciones',
	reports: 'Reportes',
	// Organización
	centers: 'Centros',
	departments: 'Departamentos',
	faculties: 'Facultades',
	positions: 'Cargos',
	// Infraestructura
	buildings: 'Edificios',
	classrooms: 'Aulas',
	// Inventario
	'pc-equipments': 'Equipos de computación',
	'audio-equipments': 'Equipos de audio',
	'air-conditioners': 'Aires acondicionados',
	'digital-blackboards': 'Pizarras digitales',
	// Catálogos
	catalog: 'Catálogo',
	brands: 'Marcas',
	conditions: 'Condiciones',
	connectivities: 'Conectividades',
	'room-types': 'Tipos de aula',
	'pc-types': 'Tipos de computadora',
	'monitor-types': 'Tipos de monitor',
	'monitor-sizes': 'Tamaños de monitor',
	'contract-types': 'Tipos de contratación',
	shifts: 'Jornadas',
	'teacher-categories': 'Categorías docentes',
	// Monitoreo de cumplimiento de horarios
	'schedule-compliance-check': 'Verificaciones de horario',
	'reports-monitor': 'Reportes de monitoreo',
	// Usuarios
	users: 'Usuarios',
	'user-departments': 'Departamentos de usuario',
	'user-status': 'Estado de usuario',
	// Vistas
	home: 'Inicio',
	help: 'Ayuda',
	profile: 'Perfil',
	'dashboard-authorities': 'Dashboard de autoridades',
	'dashboard-coordinator': 'Dashboard de coordinación',
	'dashboard-teacher': 'Dashboard de docencia',
	'dashboard-monitor': 'Dashboard de monitoreo',
	'dashboard-tab-classrooms': 'Ficha de aula (desde dashboard)',
};
