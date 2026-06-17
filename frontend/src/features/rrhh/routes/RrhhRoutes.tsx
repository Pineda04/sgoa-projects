import { Navigate, type RouteObject } from 'react-router-dom';
import { UsersRHHH, CoursesRRHH, DepartmentsRRHH } from '../pages';
import React from 'react';
import { CreateDepartment } from '@features/shared/departments';

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
		path: 'departamentos',
		element: <DepartmentsRRHH />,
	},
	{
		path: 'crear-departamento',
		element: <CreateDepartment />
	},
	{
		path: '*',
		element: <Navigate to="/rrhh" replace />,
	},
];
