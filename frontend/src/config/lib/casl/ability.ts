import { Ability, AbilityBuilder } from '@casl/ability';
import { createContext, useContext } from 'react';

export const AbilityContext = createContext<AppAbility>(new Ability());

export const useAbility = () => {
	const context = useContext(AbilityContext);
	if (!context)
		throw new Error('useAbility must be used within a AbilityProvider');
	return context;
};

export type AssignableActions =
	| 'manage'
	| 'read'
	| 'create'
	| 'update'
	| 'delete';

/**
 * `lookup` no es asignable: el backend la deriva al emitir el JWT para los
 * módulos de los que un rol depende (ej. quien gestiona Departamentos recibe
 * `lookup:faculties` para poder llenar el selector de facultades). Solo habilita
 * los listados de catálogo — nunca el menú, la ruta ni el CRUD del módulo.
 */
export type Actions = AssignableActions | 'lookup';
export type Subjects =
	| 'all'
	| 'dashboard-authorities'
	| 'dashboard-coordinator'
	| 'dashboard-teacher'
	| 'dashboard-monitor'
	| 'analytics'
	| 'analytics-academic-load'
	| 'analytics-enrollment'
	| 'analytics-classrooms'
	| 'analytics-staff'
	| 'analytics-technology'
	| 'analytics-activities'
	| 'analytics-monitoring'
	| 'dashboard-tab-classrooms'
	| 'users'
	| 'user-roles'
	| 'user-departments'
	| 'user-status'
	| 'activities'
	| 'buildings'
	| 'centers'
	| 'classrooms'
	| 'courses'
	| 'degrees'
	| 'departments'
	| 'faculties'
	| 'periods'
	| 'positions'
	| 'planifications'
	| 'reports'
	| 'pc-equipments'
	| 'air-conditioners'
	| 'digital-blackboards'
	| 'schedule-compliance-check'
	| 'reports-monitor'
	| 'teacher-categories'
	| 'contract-types'
	| 'shifts'
	| 'brands'
	| 'conditions'
	| 'connectivities'
	| 'room-types'
	| 'pc-types'
	| 'audio-equipments'
	| 'monitor-types'
	| 'monitor-sizes'
	| 'home'
	| 'help'
	| 'profile';

export type AppAbility = Ability<[Actions, Subjects]>;

const actions: readonly string[] = [
	'manage',
	'read',
	'create',
	'update',
	'delete',
	'lookup',
];

const subjects: readonly string[] = [
	'all',
	'dashboard-authorities',
	'dashboard-coordinator',
	'dashboard-teacher',
	'dashboard-monitor',
	'analytics',
	'analytics-academic-load',
	'analytics-enrollment',
	'analytics-classrooms',
	'analytics-staff',
	'analytics-technology',
	'analytics-activities',
	'analytics-monitoring',
	'dashboard-tab-classrooms',
	'users',
	'user-departments',
	'user-status',
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
	'air-conditioners',
	'digital-blackboards',
	'schedule-compliance-check',
	'reports-monitor',
	'teacher-categories',
	'contract-types',
	'shifts',
	'brands',
	'conditions',
	'connectivities',
	'room-types',
	'pc-types',
	'audio-equipments',
	'monitor-types',
	'monitor-sizes',
	'home',
	'help',
	'profile',
];

const isAction = (value?: string): value is Actions =>
	value !== undefined && actions.includes(value);

const isSubject = (value?: string): value is Subjects =>
	value !== undefined && subjects.includes(value);

// Permisos ya no se hardcodean por nombre de rol: el backend resuelve, por cada
// usuario, el set de permisos "action:subject" (o el flag isSuperAdmin) y los
// entrega en el JWT. Este catálogo de Subjects/Actions se mantiene cerrado y
// debe sincronizarse manualmente con backend/src/common/constants/permissions.constant.ts.
export function defineAbilityFor(
	permissions: string[],
	isSuperAdmin: boolean
): AppAbility {
	const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability);

	if (isSuperAdmin) {
		can('manage', 'all');
		return build();
	}

	if (permissions.length === 0) {
		cannot('manage', 'all');
		return build();
	}

	for (const entry of permissions) {
		const [action, subject, extra] = entry.split(':');
		if (extra === undefined && isAction(action) && isSubject(subject)) {
			can(action, subject);
		}
	}

	return build();
}
