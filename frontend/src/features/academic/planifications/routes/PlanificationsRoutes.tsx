import { type RouteObject } from 'react-router-dom';
import { CreatePlanification, EditPlanification, ListPlanifications, Planification } from '../pages';

export const planificationsRoutes: RouteObject[] = [
  {
    path: 'planification',
    element: <Planification />,
  },
  {
    path: 'planifications',
    element: <ListPlanifications />,
  },
  {
    path: 'new',
    element: <CreatePlanification />,
  },
  {
    path: 'edit',
    element: <EditPlanification />,
  },
];
