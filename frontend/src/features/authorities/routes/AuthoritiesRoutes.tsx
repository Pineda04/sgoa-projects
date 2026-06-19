import { Navigate, type RouteObject } from 'react-router-dom';
import { Consolidated, DashboardAuthorities } from '../pages';
import { CoursesRRHH } from '@features/rrhh/pages';

export const authoritiesRoutes: RouteObject[] = [
	{
		path: 'consolidado',
		element: <Consolidated />,
	},
	{
		path: 'dashboard-autoridad',
		element: <DashboardAuthorities />,
	},
	{
		path: 'clases',
		element: <CoursesRRHH />,
	},
	{
		path: '*',
		element: <Navigate to="/autoridades" replace />,
	},
];
