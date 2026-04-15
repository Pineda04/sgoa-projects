import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AppLayout } from './AppLayout';
import { Loading } from '@components';
import { AuthContext } from '@providers/auth';
import { IChildrenProps } from '@types';

export const PrivateRoute = ({ children }: IChildrenProps) => {
	const {
		authState: { isAuthenticated, isLoading },
	} = useContext(AuthContext);
	const { pathname, search } = useLocation();

	const lastPath = pathname + search;
	localStorage.setItem('lastPath', lastPath);

	if (isLoading) return <Loading />;

	return !isLoading && !isAuthenticated ? (
		<Navigate to="/auth/login/" />
	) : (
		(children ?? <AppLayout />)
	);
};
