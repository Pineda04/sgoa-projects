import { Navigate, type RouteObject } from 'react-router-dom';
import { RedirectToDefaultDepartment } from '@features/academic/course-classrooms/routes/redirects/RedirectToDeafultDeparment';
import { CreatePlanification } from '@features/academic/planifications/pages/CreatePlanification';
import { DashboardCoordinator } from '@features/academic/dashboards/pages';

export const courseClassroomsRoutes: RouteObject[] = [
	{
		path: '',
		element: <RedirectToDefaultDepartment />,
	},
	{
		path: ':centerDepartmentId',
		element: <DashboardCoordinator />,
	},
	{
		path: ':centerDepartmentId/planifications/new',
		element: <CreatePlanification />,
	},
	{
		path: '*',
		element: <Navigate to="/academic/course-classrooms" replace />,
	},
];
