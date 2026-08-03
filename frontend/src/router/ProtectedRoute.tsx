import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppLayout } from './AppLayout';
import { AuthContext } from '@config/providers';
import { useAbility } from '@config';
import { Loading } from '@shared/components';
import type { Actions, Subjects } from '@config/lib/casl/ability';

interface ProtectedRouteProps {
	action?: Actions;
	/** Con varios, basta con poder sobre uno: la ruta de aulas la abre tanto
	 * `classrooms` como el acceso acotado desde un dashboard. */
	subject?: Subjects | Subjects[];
	superAdminOnly?: boolean;
}

export const ProtectedRoute = ({
	action,
	subject,
	superAdminOnly,
}: ProtectedRouteProps) => {
	const {
		authState: { isAuthenticated, isLoading, user },
	} = useContext(AuthContext);
	const ability = useAbility();

	if (isLoading) return <Loading />;

	if (!isAuthenticated) return <Navigate to="/auth/login/" />;

	if (superAdminOnly && !user?.isSuperAdmin)
		return <Navigate to="/home" replace />;

	const subjects = subject
		? Array.isArray(subject)
			? subject
			: [subject]
		: [];

	if (action && subjects.length && !subjects.some(s => ability.can(action, s)))
		return <Navigate to="/home" replace />;

	return <AppLayout />;
};
