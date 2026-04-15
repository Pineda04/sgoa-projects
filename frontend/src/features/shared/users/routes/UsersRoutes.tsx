import { Navigate, RouteObject } from 'react-router-dom';
import { Profile } from '../pages';

export const usersRoutes: RouteObject[] = [
	{
		path: 'perfil',
		element: <Profile />,
	},
	{
		path: '*',
		element: <Navigate to="/perfil" replace />,
	},
];
