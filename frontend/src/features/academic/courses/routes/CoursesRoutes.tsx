import React from 'react';
import { type RouteObject } from 'react-router-dom';

const CreateCourseLazy = React.lazy(() =>
  import('../pages/CreateCourse').then(module => ({
    default: module.CreateCourse,
  }))
);

const CourseEditLazy = React.lazy(() =>
  import('../pages/CourseEdit').then(module => ({
    default: module.CourseEdit,
  }))
);

export const coursesRoutes: RouteObject[] = [
  {
    path: 'new',
    element: (
      <React.Suspense fallback={<div>Cargando...</div>}>
        <CreateCourseLazy />
      </React.Suspense>
    ),
  },
  {
    path: 'edit/:id',
    element: (
      <React.Suspense fallback={<div>Cargando...</div>}>
        <CourseEditLazy />
      </React.Suspense>
    ),
  },
];
