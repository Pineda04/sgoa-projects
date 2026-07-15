import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppLayout } from './AppLayout';
import { AuthContext } from '@config/providers';
import { useAbility } from '@config';
import { Loading } from '@shared/components';
import type { Actions, Subjects } from '@config/lib/casl/ability';

interface ProtectedRouteProps {
	action?: Actions;
	subject?: Subjects;
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

	if (action && subject && !ability.can(action, subject))
		return <Navigate to="/home" replace />;

	return <AppLayout />;
};
