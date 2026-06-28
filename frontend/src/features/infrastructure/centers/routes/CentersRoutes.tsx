import React from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

const ListCentersLazy = React.lazy(() =>
  import('../pages').then(module => ({ default: module.ListCenters }))
);

export const centersRoutes: RouteObject[] = [
  {
    path: '',
    element: (
      <React.Suspense fallback={<div>Cargando lista...</div>}>
        <ListCentersLazy />
      </React.Suspense>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/infrastructure/centers" replace />,
  },
];
