import { useMemo, type ReactNode } from 'react';
import type { Actions, AppAbility, Subjects } from './ability';
import { AbilityContext, defineAbilityFor, useAbility } from './ability';
import { useAuth } from '@config/providers';

interface CanProps {
	children:
		| ReactNode
		| ((props: { isAllowed: boolean; ability: AppAbility }) => ReactNode);
	action: Actions;
	subject: Subjects;
	not?: boolean;
}

export const Can = ({ children, action, subject, not }: CanProps) => {
	const ability = useAbility();
	let isAllowed = ability.can(action, subject);
	if (not) isAllowed = !isAllowed;

	if (typeof children === 'function') {
		return <>{children({ isAllowed, ability })}</>;
	}

	return isAllowed ? <>{children}</> : null;
};

export const AbilityProvider = ({ children }: { children: ReactNode }) => {
	const { authState } = useAuth();

	const ability = useMemo(
		() =>
			defineAbilityFor(
				authState.user?.permissions ?? [],
				authState.user?.isSuperAdmin ?? false
			),
		[authState.user?.permissions, authState.user?.isSuperAdmin]
	);

	return (
		<AbilityContext.Provider value={ability}>
			{children}
		</AbilityContext.Provider>
	);
};
