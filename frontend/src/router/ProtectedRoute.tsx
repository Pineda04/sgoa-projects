import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AppLayout } from './AppLayout';
import { AuthContext } from '@config/providers';
import { useAbility } from '@config';
import { useIsOnline } from '@shared/hooks';
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
	const isOnline = useIsOnline();
	const { pathname } = useLocation();

	if (isLoading) return <Loading />;

	if (!isAuthenticated) return <Navigate to="/auth/login/" />;

	if (superAdminOnly && !user?.isSuperAdmin)
		return <Navigate to="/home" replace />;

	// Feature: sin conexión solo el dashboard de monitoreo funciona (modo offline).
	// Las demás rutas redirigen ahí únicamente cuando el usuario puede accederlo;
	// si no (roles sin monitoreo), se conserva el flujo actual para no crear bucles.
	if (
		!isOnline &&
		!pathname.startsWith('/dashboard/monitor') &&
		ability.can('read', 'dashboard-monitor')
	)
		return <Navigate to="/dashboard/monitor" replace />;

	const subjects = subject
		? Array.isArray(subject)
			? subject
			: [subject]
		: [];

	if (action && subjects.length && !subjects.some(s => ability.can(action, s)))
		return <Navigate to="/home" replace />;

	return <AppLayout />;
};
