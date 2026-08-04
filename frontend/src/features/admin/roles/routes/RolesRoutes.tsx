import { Navigate, type RouteObject } from 'react-router-dom';
import { RolesRouter } from './RolesRouter';
import { ListRoles } from '../pages';

export const rolesRoutes: RouteObject[] = [
	{
		path: '',
		element: <RolesRouter />,
		children: [
			{
				index: true,
				element: <ListRoles />,
			},
			{
				path: '*',
				element: <Navigate to="/admin/roles" replace />,
			},
		],
	},
];
