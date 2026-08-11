import { type RouteObject } from 'react-router-dom';
import {
	CreatePlanification,
	Planification,
	PlanificationAuthority,
} from '../pages';

export const planificationsRoutes: RouteObject[] = [
	{
		path: 'new/:centerDepartmentId',
		element: <CreatePlanification />,
	},
	{
		path: 'details/:periodId/:centerDepartmentId/:year/:pac',
		element: <Planification />,
	},
	{
		path: 'authority/:periodId/:centerDepartmentId/:year/:pac',
		element: <PlanificationAuthority />,
	},
];
