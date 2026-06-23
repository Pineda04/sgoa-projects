import { type RouteObject } from 'react-router-dom';
import { CreatePlanification, EditPlanification, ListPlanifications, Planification } from '../pages';

export const planificationsRoutes: RouteObject[] = [
  {
		path: 'new/:centerDepartmentId',
		element: <CreatePlanification />,
	},
	{
		path: 'edit/:id',
		element: <EditPlanification />,
	},
	{
		path: ':id',
		element: <Planification />,
	},
  {
    path: '',
    element: <ListPlanifications />,
  },
];
