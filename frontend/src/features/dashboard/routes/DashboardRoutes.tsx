import { type RouteObject } from 'react-router-dom';
import { DashboardAuthorities, DashboardCoordinator, DashboardTeacher } from '../pages';
import { RedirectToDefaultDepartment } from './RedirectToDefaultDepartment';

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'authorities',
    element: <DashboardAuthorities />,
  },
  {
		path: 'coordinator',
		element: <RedirectToDefaultDepartment />,
	},
	{
		path: 'coordinator/:centerDepartmentId',
		element: <DashboardCoordinator />,
	},
  {
    path: 'teacher',
    element: <DashboardTeacher />,
  },
];
