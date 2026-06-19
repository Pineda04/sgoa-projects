import React from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

const AcademicPeriodsListLazy = React.lazy(() =>
	import('../pages').then(module => ({ default: module.AcademicPeriodsList }))
);

export const academicPeriodsRoutes: RouteObject[] = [
	{
		path: '',
		element: (
			<React.Suspense fallback={<div>Cargando periodos...</div>}>
				<AcademicPeriodsListLazy />
			</React.Suspense>
		),
	},
	{
		path: '*',
		element: <Navigate to="" replace />,
	},
];
