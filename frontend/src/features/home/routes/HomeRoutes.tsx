import { Navigate, type RouteObject } from 'react-router-dom';
import { Home } from '../pages';

export const homeRoutes: RouteObject[] = [
	{
		path: '',
		element: <Home />,
	},
	{
		path: '*',
		element: <Navigate to="/" replace />,
	},
];
