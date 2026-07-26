import { Navigate, type RouteObject } from 'react-router-dom';
import { Catalog } from '../pages';

export const catalogRoutes: RouteObject[] = [
  {
    path: '',
    element: <Catalog />,
  },
  {
    path: '*',
    element: <Navigate to="/catalog" replace />,
  },
];
