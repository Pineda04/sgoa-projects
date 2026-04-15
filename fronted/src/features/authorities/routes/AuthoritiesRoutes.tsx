import { Navigate, type RouteObject } from 'react-router-dom';
import { Consolidated, DashboardAuthorities, CoursesAuthority } from '../pages';

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
		element: <CoursesAuthority />,
	},
	{
		path: '*',
		element: <Navigate to="/autoridades" replace />,
	},
];
