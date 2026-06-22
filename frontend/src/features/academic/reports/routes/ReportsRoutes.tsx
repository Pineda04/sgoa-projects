import { type RouteObject } from 'react-router-dom';
import { AcademicAssigmentReport, AcademicAssignmentReport, Consolidated } from '../pages';

export const reportsRoutes: RouteObject[] = [
  {
    path: 'teacher/:id',
    element: <AcademicAssignmentReport />,
  },
  {
    path: 'coordinator/:id',
    element: <AcademicAssigmentReport />,
  },
  {
    path: '',
    element: <Consolidated />,
  },
];
