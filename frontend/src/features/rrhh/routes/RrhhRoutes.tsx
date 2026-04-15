import { Navigate, type RouteObject } from 'react-router-dom';
import { UsersRHHH, CoursesRRHH } from '../pages';
import React from 'react';

const CreateUserLazy = React.lazy(() =>
	import('../../shared/users/pages/CreateUser').then(module => ({
		default: module.CreateUser,
	}))
);

export const rrhhRoutes: RouteObject[] = [
	{
		path: 'gestion-usuarios',
		element: <UsersRHHH />,
	},
	{
		path: 'crear-usuario',
		// element: <CreateUser />,
		element: (
			<React.Suspense fallback={<div>Cargando...</div>}>
				<CreateUserLazy />
			</React.Suspense>
		),
	},
	{
		path: 'clases',
		element: <CoursesRRHH />,
	},
	{
		path: '*',
		element: <Navigate to="/rrhh" replace />,
	},
];
