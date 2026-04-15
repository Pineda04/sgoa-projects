import { Loading } from '@components';
import { useAuth } from '@providers/auth';
import { IChildrenProps } from '@types';
import { Navigate, Outlet } from 'react-router-dom';

export const PublicRoute = ({ children }: IChildrenProps) => {
	const {
		authState: { isLoading, isAuthenticated },
	} = useAuth();

	if (isLoading) return <Loading />;

	return !isLoading && isAuthenticated ? (
		<Navigate to="/" />
	) : (
		(children ?? <Outlet />)
	);
};
