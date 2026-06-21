import { Navigate, type RouteObject } from 'react-router-dom';
// import { AcademicAssignmentReport } from '@features/academic/reports/pages';
// import { AcademicAssigmentReport } from '@features/academic/course-classrooms/pages';
import { PerformanceConsolited } from '@features/academic/course-classrooms/pages';
import { Consolidated } from '@features/academic/reports/pages';
import { DashboardAuthorities, DashboardTeacher } from '@features/academic/dashboards';

export const reportsRoutes: RouteObject[] = [
  {
    path: 'teacher',
    element: <DashboardTeacher />,
  },
  // {
  //   path: 'teacher/:id',
  //   element: <AcademicAssignmentReport />,
  // },
  // {
  //   path: 'coordinator/:id',
  //   element: <AcademicAssigmentReport />,
  // },
  {
    path: 'performance',
    element: <PerformanceConsolited />,
  },
  {
    path: 'dashboard',
    element: <DashboardAuthorities />,
  },
  {
    path: 'consolidated',
    element: <Consolidated />,
  },
  {
    path: '*',
    element: <Navigate to="/academic/reports" replace />,
  },
];
