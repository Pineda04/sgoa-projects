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
	| 'degrees' // undergrads + postgrads
	| 'departments'
	| 'faculties'
	| 'periods'
	| 'positions'
	| 'planifications'
	| 'shifts'
	| 'pcEquipments'
	| 'audioEquipments'
	| 'users'
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

	// ==================== Permisos para ADMIN ====================
	if (roles.includes(EUserRole.ADMIN)) {
		can('manage', 'all');
		return build();
	}

	// ================== Permisos para DIRECCION ==================
	if (roles.includes(EUserRole.DIRECCION)) {
		can('read', ['all']);
		can('create', ['all']);
		can('update', ['all']);
		can('delete', ['all']);
	}

	// ==================== Permisos para RRHH ====================
	if (roles.includes(EUserRole.RRHH)) {
		can('read', ['all']);
		can('create', ['all']);
		can('update', ['all']);
		can('delete', ['all']);
	}

	// ============== Permisos para COORDINADOR_AREA ==============
	if (roles.includes(EUserRole.COORDINADOR_AREA)) {
		can('read', ['all']);
		can('create', ['all']);
		can('update', ['all']);
		can('delete', ['all']);
	}

	// =================== Permisos para DOCENTE ==================
	if (roles.includes(EUserRole.DOCENTE)) {
		can('read', ['all']);
		can('create', ['all']);
		can('update', ['all']);
		can('delete', ['all']);
	}

	return build();
}
