import React from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { ListUsers, UserProfile } from '../pages';

const CreateUserLazy = React.lazy(() =>
  import('../pages/CreateUser').then(module => ({
    default: module.CreateUser,
  }))
);

export const usersRoutes: RouteObject[] = [
  {
    path: '',
    element: <ListUsers />,
  },
  {
    path: 'new',
    element: (
      <React.Suspense fallback={<div>Cargando...</div>}>
        <CreateUserLazy />
      </React.Suspense>
    ),
  },
  {
    path: 'profile',
    element: <UserProfile />,
  },
  {
    path: '*',
    element: <Navigate to="/admin/users" replace />,
  },
];
