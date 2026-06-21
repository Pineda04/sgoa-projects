import { useAuth } from '@config/providers';
import { Loading } from '@shared/components';
import { IChildrenProps } from '@shared/interfaces';
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
