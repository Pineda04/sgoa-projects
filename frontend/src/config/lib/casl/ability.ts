import { Ability, AbilityBuilder } from '@casl/ability';
import { EUserRole } from '@shared/constants';
import { createContext, useContext } from 'react';

export const AbilityContext = createContext<AppAbility>(new Ability());

export const useAbility = () => {
	const context = useContext(AbilityContext);
	if (!context)
		throw new Error('useAbility must be used within a AbilityProvider');
	return context;
};

export type Actions = 'manage' | 'read' | 'create' | 'update' | 'delete';
export type Subjects =
	| 'all'
	| 'dashboard-authorities'
	| 'dashboard-coordinator'
	| 'dashboard-teacher'
	| 'dashboard-monitor'
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
	| 'audio-equipments'
	| 'airConditioners'
	| 'schedule-compliance-check'
  | 'reports-monitor'
	| 'catalog'
	| 'teacher-categories'
	| 'contract-types'
	| 'brands'
	| 'conditions'
	| 'connectivities'
	| 'room-types'
	| 'pc-types'
	| 'monitor-types'
	| 'monitor-sizes'
	| 'home'
	| 'help'
	| 'profile';

export type AppAbility = Ability<[Actions, Subjects]>;

export function defineAbilityFor(roles: string[]): AppAbility {
	const { can, cannot, build } = new AbilityBuilder<AppAbility>(Ability);

	if (!roles || roles.length === 0) {
		cannot('manage', 'all');
		return build();
	}

	if (roles.includes(EUserRole.ADMIN)) {
		can('manage', 'all');
		cannot('read', 'dashboard-coordinator');
		cannot('read', 'dashboard-teacher');
		cannot('read', 'dashboard-monitor');
		return build();
	}

	// ================== DIRECCION ==================
	if (roles.includes(EUserRole.DIRECCION)) {
    can('manage', 'dashboard-authorities');

    // Usuarios
		can('manage', 'users');
		can('manage', 'user-roles');
    can('manage', 'user-status');
		can('manage', 'user-departments');

    // Modulos/Secciones
		can('manage', 'courses');
		can('manage', 'departments');
		can('manage', 'pc-equipments');
		can('manage', 'audio-equipments');
		can('manage', 'centers');
		can('manage', 'buildings');
		can('manage', 'classrooms');
		can('manage', 'degrees');
		can('manage', 'faculties');
		can('manage', 'positions');
		can('manage', 'airConditioners');
    can('manage', 'periods');
		can('read', 'reports');
		can('read', 'planifications');

    // Catalogo
		can('manage', 'catalog');
		can('manage', 'teacher-categories');
		can('manage', 'contract-types');
		can('manage', 'brands');
		can('manage', 'conditions');
		can('manage', 'connectivities');
		can('manage', 'room-types');
		can('manage', 'pc-types');
		can('manage', 'monitor-types');
		can('manage', 'monitor-sizes');
	}

	// ==================== RRHH ====================
	if (roles.includes(EUserRole.RRHH)) {
		can('manage', 'dashboard-authorities');

		// Usuarios
    can('manage', 'users');
		can('manage', 'user-roles');
		can('manage', 'user-status');
    can('manage', 'user-departments');

    // Modulos/Secciones
		can('manage', 'courses');
		can('manage', 'departments');
		can('manage', 'buildings');
		can('manage', 'classrooms');
		can('manage', 'degrees');
		can('manage', 'faculties');
		can('manage', 'positions');
		can('manage', 'airConditioners');
    can('manage', 'periods');
		can('read', 'reports');
		can('read', 'planifications');

		// Catalogo
		can('manage', 'catalog');
		can('manage', 'teacher-categories');
		can('manage', 'contract-types');
		can('manage', 'brands');
    can('manage', 'conditions');
    can('manage', 'connectivities');
    can('manage', 'room-types');
    can('manage', 'pc-types');
		can('manage', 'monitor-types');
		can('manage', 'monitor-sizes');
	}

	// ============== COORDINADOR_AREA ==============
	if (roles.includes(EUserRole.COORDINADOR_AREA)) {
		can('manage', 'dashboard-coordinator');

		// Usuarios
    can('manage', 'users');

    // Modulos/Secciones
		can('manage', 'reports');
		can('manage', 'planifications');
		can('read', 'courses');
		can('read', 'pc-equipments');
		can('read', 'audio-equipments');
		can('read', 'classrooms');
		can('read', 'airConditioners');
	}

	// =================== DOCENTE ==================
	if (roles.includes(EUserRole.DOCENTE)) {
		can('manage', 'dashboard-teacher');

		// Modulos/Secciones
    can('read', 'courses');
		can('read', 'reports');
		can('read', 'planifications');
		can('read', 'classrooms');
	}

	// =================== MONITOR ==================
	if (roles.includes(EUserRole.MONITOR)) {
		can('manage', 'dashboard-monitor');

		// Modulos/Secciones
    can('manage', 'schedule-compliance-check');
		can('read', 'classrooms');
		can('read', 'buildings');
	}

	return build();
}
