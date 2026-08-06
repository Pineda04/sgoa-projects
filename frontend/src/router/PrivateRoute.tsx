import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AppLayout } from './AppLayout';
import { IChildrenProps } from '@shared/interfaces';
import { AuthContext } from '@config/providers';
import { useAbility } from '@config';
import { useIsOnline } from '@shared/hooks';
import { Loading } from '@shared/components';

export const PrivateRoute = ({ children }: IChildrenProps) => {
	const {
		authState: { isAuthenticated, isLoading },
	} = useContext(AuthContext);
	const ability = useAbility();
	const isOnline = useIsOnline();
	const { pathname, search } = useLocation();

	const lastPath = pathname + search;
	localStorage.setItem('lastPath', lastPath);

	if (isLoading) return <Loading />;

	if (!isAuthenticated) return <Navigate to="/auth/login/" />;

	// Feature: sin conexión solo el dashboard de monitoreo funciona (modo offline);
	// Home, Ayuda y demás rutas sin red redirigen al checklist de monitoreo.
	if (
		!isOnline &&
		!pathname.startsWith('/dashboard/monitor') &&
		ability.can('read', 'dashboard-monitor')
	)
		return <Navigate to="/dashboard/monitor" replace />;

	return children ?? <AppLayout />;
};
