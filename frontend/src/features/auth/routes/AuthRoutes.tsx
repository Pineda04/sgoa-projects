import { Navigate, type RouteObject } from 'react-router-dom';
import { Login, ResetPassword } from '../pages';

export const authRoutes: RouteObject[] = [
	{
		path: 'login',
		element: <Login />,
	},
	{
		path: 'reset-password',
		element: <ResetPassword />,
	},
	{
		path: '*',
		element: <Navigate to="/auth/login" replace />,
	},
];
