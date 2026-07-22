import { Navigate, type RouteObject } from 'react-router-dom';
import { Configuration } from '../pages';

export const configurationRoutes: RouteObject[] = [
  {
    path: '',
    element: <Configuration />,
  },
  {
    path: '*',
    element: <Navigate to="/configuration" replace />,
  },
];
