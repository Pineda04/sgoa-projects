import React from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { ListCourses } from '../pages';

const CreateCourseLazy = React.lazy(() =>
  import('../pages/CreateCourse').then(module => ({
    default: module.CreateCourse,
  }))
);

const CourseEditLazy = React.lazy(() =>
  import('../components/CourseEdit').then(module => ({
    default: module.CourseEdit,
  }))
);

export const coursesRoutes: RouteObject[] = [
  {
    path: '',
    element: <ListCourses />,
  },
  {
    path: 'new',
    element: (
      <React.Suspense fallback={<div>Cargando...</div>}>
        <CreateCourseLazy />
      </React.Suspense>
    ),
  },
  {
    path: ':id',
    element: (
      <React.Suspense fallback={<div>Cargando...</div>}>
        <CourseEditLazy />
      </React.Suspense>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/academic/courses" replace />,
  },
];
