import React from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { ListPositions } from '../pages';

const CreatePositionLazy = React.lazy(() =>
	import('../pages/CreatePosition').then(module => ({
		default: module.CreatePosition,
	}))
);

export const positionsRoutes: RouteObject[] = [
	{
		path: '',
		element: <ListPositions />,
	},
	{
		path: 'new',
		element: (
			<React.Suspense fallback={<div>Cargando...</div>}>
				<CreatePositionLazy />
			</React.Suspense>
		),
	},
	{
		path: '*',
		element: <Navigate to={'/admin/positions'} replace />,
	},
];
