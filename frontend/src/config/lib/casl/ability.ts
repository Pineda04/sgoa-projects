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
	| 'academic-module'
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
		can('read', 'users');
		can('manage', 'courses');
		can('manage', 'departments');
		can('read', 'centers');
		can('manage', 'pcEquipments');
		can('read', 'audioEquipments');
		can('read', 'degrees');
		can('read', 'shifts');
		can('read', 'contract-types');
		can('read', 'periods');
		can('read', 'faculties');
		can('read', 'positions');
		can('read', 'academic-module');
		can('read', 'dashboard-authorities');
		can('manage', 'buildings');
		can('manage', 'classrooms');
	}

	// ==================== RRHH ====================
	if (roles.includes(EUserRole.RRHH)) {
		can('manage', 'users');
		can('manage', 'user-roles');
		can('manage', 'user-status');
		can('manage', 'courses');
		can('manage', 'departments');
		can('read', 'centers');
		can('manage', 'pcEquipments');
		can('read', 'audioEquipments');
		can('read', 'degrees');
		can('read', 'shifts');
		can('read', 'contract-types');
		can('read', 'periods');
		can('read', 'faculties');
		can('read', 'positions');
		can('read', 'academic-module');
		can('read', 'dashboard-authorities');
		can('manage', 'buildings');
		can('manage', 'classrooms');
	}

	// ============== COORDINADOR_AREA ==============
	if (roles.includes(EUserRole.COORDINADOR_AREA)) {
		can('create', 'users');
		can('read', 'users');
		can('update', 'users');
		can('manage', 'user-departments');
		can('manage', 'user-status');
		can('manage', 'courses');
		can('read', 'departments');
		can('read', 'pcEquipments');
		can('read', 'audioEquipments');
		can('read', 'degrees');
		can('read', 'shifts');
		can('read', 'contract-types');
		can('read', 'periods');
		can('read', 'faculties');
		can('read', 'academic-module');
		can('read', 'dashboard-coordinator');
		can('read', 'buildings');
		can('read', 'classrooms');
	}

	// =================== DOCENTE ==================
	if (roles.includes(EUserRole.DOCENTE)) {
		can('read', 'courses');
		can('read', 'departments');
		can('read', 'degrees');
		can('read', 'shifts');
		can('read', 'contract-types');
		can('read', 'periods');
		can('read', 'dashboard-teacher');
		can('read', 'classrooms');
	}

	return build();
}
