import { Navigate, type RouteObject } from 'react-router-dom';
import { EditPlanification } from '@features/academic/course-classrooms/pages';
import { Planification } from '@features/academic/planifications';

export const planificationsRoutes: RouteObject[] = [
  {
    path: '',
    element: <Planification />,
  },
  {
    path: 'edit',
    element: <EditPlanification />,
  },
  {
    path: '*',
    element: <Navigate to="/academic/planifications" replace />,
  },
];
