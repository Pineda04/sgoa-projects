import { Navigate, type RouteObject } from 'react-router-dom';
import { ListDepartments } from '../pages';

export const departmentsRoutes: RouteObject[] = [
	{
		path: '',
		element: <ListDepartments />,
	},
	{
		path: '*',
		element: <Navigate to={'/admin/departments'} replace />,
	},
];
