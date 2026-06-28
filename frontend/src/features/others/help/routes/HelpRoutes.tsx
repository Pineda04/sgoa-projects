import { Navigate, type RouteObject } from 'react-router-dom';
import { Help } from '../pages';

export const helpRoutes: RouteObject[] = [
  {
    path: '',
    element: <Help />,
  },
  {
    path: '*',
    element: <Navigate to="/help" replace />,
  },
];
