import { type RouteObject } from 'react-router-dom';
import { CreatePlanification, EditPlanification, ListPlanifications, Planification } from '../pages';

export const planificationsRoutes: RouteObject[] = [
  {
    path: ':id',
    element: <Planification />,
  },
  {
    path: '',
    element: <ListPlanifications />,
  },
  {
    path: 'new',
    element: <CreatePlanification />,
  },
  {
    path: 'edit/:id',
    element: <EditPlanification />,
  },
];
