import { type RouteObject } from 'react-router-dom';
import { CreatePlanification, Planification } from '../pages';

export const planificationsRoutes: RouteObject[] = [
  {
		path: 'new/:centerDepartmentId',
		element: <CreatePlanification />,
	},
	{
		path: 'details/:periodId/:centerDepartmentId/:year/:pac',
		element: <Planification />,
	},
];
