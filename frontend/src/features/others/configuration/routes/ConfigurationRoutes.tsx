import { Navigate, type RouteObject } from 'react-router-dom';

export const configurationRoutes: RouteObject[] = [
  {
    path: '',
    // element: <Help />,
  },
  {
    path: '*',
    element: <Navigate to="/configuration" replace />,
  },
];
