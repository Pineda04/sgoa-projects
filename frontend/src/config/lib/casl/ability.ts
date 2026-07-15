import { Ability, AbilityBuilder } from '@casl/ability';
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
	| 'users'
	| 'user-departments'
	| 'user-status'
	| 'home'
	| 'help'
	| 'profile'
	| 'dashboard-authorities'
	| 'dashboard-coordinator'
	| 'dashboard-teacher';

export type AppAbility = Ability<[Actions, Subjects]>;

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

	if (!permissions || permissions.length === 0) {
		cannot('manage', 'all');
		return build();
	}

	for (const entry of permissions) {
		const [action, subject] = entry.split(':') as [Actions, Subjects];
		if (action && subject) can(action, subject);
	}

	return build();
}
