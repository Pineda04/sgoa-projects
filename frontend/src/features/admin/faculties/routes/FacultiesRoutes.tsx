import { Navigate, type RouteObject } from 'react-router-dom';
import { ListFaculties } from '../pages';

export const facultiesRoutes: RouteObject[] = [
	{
		path: '',
		element: <ListFaculties />,
	},
	{
		path: '*',
		element: <Navigate to={'/admin/faculties'} replace />,
	},
];
