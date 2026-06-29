import React from 'react';
import { type RouteObject } from 'react-router-dom';
import { UserProfile } from '../pages';

const CreateUserLazy = React.lazy(() =>
  import('../pages/CreateUser').then(module => ({
    default: module.CreateUser,
  }))
);

export const usersRoutes: RouteObject[] = [
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
];
