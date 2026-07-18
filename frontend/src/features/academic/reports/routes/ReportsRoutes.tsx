import { type RouteObject } from 'react-router-dom';
import { AcademicAssignmentReport, CoordinatorAssignmentReport, MonitorReport } from '../pages';

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
    path: 'monitor',
    element: <MonitorReport />,
  },
];
