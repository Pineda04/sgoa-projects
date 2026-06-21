import { type RouteObject } from 'react-router-dom';
import { DashboardAuthorities, DashboardCoordinator, DashboardTeacher } from '../pages';

export const dashboardsRoutes: RouteObject[] = [
  {
    path: 'authorities',
    element: <DashboardAuthorities />,
  },
  {
    path: 'coordinator',
    element: <DashboardCoordinator />,
  },
  {
    path: 'teacher',
    element: <DashboardTeacher />,
  },
];
