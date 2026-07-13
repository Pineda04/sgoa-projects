import React from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { Loading } from '@shared/components';
import { ClassroomsRouter } from './ClassroomsRouter';

const ListClassroomsLazy = React.lazy(() =>
	import('../pages/ListClassrooms').then(module => ({
		default: module.ListClassrooms,
	}))
);

const CreateClassroomLazy = React.lazy(() =>
	import('../pages/CreateClassroom').then(module => ({
		default: module.CreateClassroom,
	}))
);

const EditClassroomLazy = React.lazy(() =>
	import('../pages/EditClassroom').then(module => ({
		default: module.EditClassroom,
	}))
);

export const classroomsRoutes: RouteObject[] = [
	{
		path: '',
		element: <ClassroomsRouter />,
		children: [
			{
				index: true,
				element: (
					<React.Suspense fallback={<Loading />}>
						<ListClassroomsLazy />
					</React.Suspense>
				),
			},
			{
				path: 'new',
				element: (
					<React.Suspense fallback={<Loading />}>
						<CreateClassroomLazy />
					</React.Suspense>
				),
			},
			{
				path: 'edit/:id',
				element: (
					<React.Suspense fallback={<Loading />}>
						<EditClassroomLazy />
					</React.Suspense>
				),
			},
			{
				path: '*',
				element: <Navigate to="/infrastructure/classrooms" replace />,
			},
		],
	},
];
