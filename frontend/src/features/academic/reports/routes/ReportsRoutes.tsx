import { type RouteObject } from 'react-router-dom';
import { AcademicAssignmentReport, Consolidated, CoordinatorAssignmentReport } from '../pages';

export const reportsRoutes: RouteObject[] = [
  {
    path: 'teacher/:id',
    element: <AcademicAssignmentReport />,
  },
  {
    path: 'coordinator/:id',
    element: <CoordinatorAssignmentReport />,
  },
  {
    path: 'consolidated',
    element: <Consolidated />,
  },
];
