import React from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { Loading } from '@shared/components';
import { ClassroomsRouter } from './ClassroomsRouter';

const ListClassroomsLazy = React.lazy(() =>
	import('../pages/ListClassrooms').then(module => ({
		default: module.ListClassrooms,
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
				path: '*',
				element: <Navigate to="/infrastructure/classrooms" replace />,
			},
		],
	},
];
