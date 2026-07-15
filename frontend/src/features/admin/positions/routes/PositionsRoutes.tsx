import { Navigate, type RouteObject } from 'react-router-dom';
import { ListPositions } from '../pages';

export const positionsRoutes: RouteObject[] = [
	{
		path: '',
		element: <ListPositions />,
	},
	{
		path: '*',
		element: <Navigate to={'/admin/positions'} replace />,
	},
];
