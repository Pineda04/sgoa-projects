import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppLayout } from './AppLayout';
import { AuthContext } from '@config/providers';
import { useAbility } from '@config';
import { Loading } from '@shared/components';
import type { Actions, Subjects } from '@config/lib/casl/ability';

interface ProtectedRouteProps {
	action: Actions;
	subject: Subjects | Subjects[];
}

export const ProtectedRoute = ({ action, subject }: ProtectedRouteProps) => {
	const {
		authState: { isAuthenticated, isLoading },
	} = useContext(AuthContext);
	const ability = useAbility();

	if (isLoading) return <Loading />;

	if (!isAuthenticated) return <Navigate to="/auth/login/" />;

	const subjects = Array.isArray(subject) ? subject : [subject];

	if (!subjects.some(s => ability.can(action, s)))
		return <Navigate to="/home" replace />;

	return <AppLayout />;
};
