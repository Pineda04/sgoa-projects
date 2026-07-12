import {
	Ability,
	AbilityBuilder,
} from '@casl/ability';
import { EUserRole } from '@shared/constants';
import { createContext, useContext } from 'react';

export const AbilityContext = createContext<AppAbility>(new Ability());

export const useAbility = () => {
	const context = useContext(AbilityContext);
	if (!context) throw new Error('useAbility must be used within a AbilityProvider');
	return context;
};

export type Actions = 'manage' | 'read' | 'create' | 'update' | 'delete';
export type Subjects =
	| 'all'
	| 'activities'
	| 'activityTypes'
	| 'assignment-reports'
	| 'brands'
	| 'buildings'
	| 'centers'
	| 'classrooms'
	| 'classroomTypes'
	| 'contract-types'
	| 'courses'
	| 'courseClassrooms'
	| 'degrees'
	| 'departments'
	| 'faculties'
	| 'periods'
	| 'positions'
	| 'planifications'
	| 'shifts'
	| 'pcEquipments'
	| 'audioEquipments'
	| 'users'
	| 'user-roles'
	| 'user-departments'
	| 'user-status'
	| 'home'
	| 'help'
	| 'profile'
	| 'dashboard-authorities'
	| 'dashboard-coordinator'
	| 'dashboard-teacher';

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
		return build();
	}

	// ================== DIRECCION ==================
	if (roles.includes(EUserRole.DIRECCION)) {
		can('manage', 'dashboard-authorities');
		can('manage', 'courses');
		can('manage', 'departments');
		can('manage', 'pcEquipments');
		can('manage', 'centers');
		can('manage', 'buildings');
		can('manage', 'classrooms');
		can('manage', 'audioEquipments');
		can('manage', 'degrees');
		can('manage', 'faculties');
		can('manage', 'positions');
	}

	// ==================== RRHH ====================
	if (roles.includes(EUserRole.RRHH)) {
		can('manage', 'dashboard-authorities');
		can('manage', 'users');
		can('manage', 'user-roles');
		can('manage', 'user-status');
		can('manage', 'courses');
		can('manage', 'departments');
		can('manage', 'buildings');
		can('manage', 'classrooms');
		can('manage', 'degrees');
		can('manage', 'audioEquipments');
		can('manage', 'faculties');
		can('manage', 'positions');
	}

	// ============== COORDINADOR_AREA ==============
	if (roles.includes(EUserRole.COORDINADOR_AREA)) {
		can('manage', 'dashboard-coordinator');
		can('manage', 'users');
		can('manage', 'user-departments');
		can('manage', 'user-status');
		can('manage', 'courses');
		can('read', 'pcEquipments');
		can('read', 'audioEquipments');
		can('read', 'classrooms');
	}

	// =================== DOCENTE ==================
	if (roles.includes(EUserRole.DOCENTE)) {
		can('manage', 'dashboard-teacher');
		can('read', 'classrooms');
	}

	return build();
}
