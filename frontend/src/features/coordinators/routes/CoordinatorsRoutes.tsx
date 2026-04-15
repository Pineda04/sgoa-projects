import { Navigate, type RouteObject } from 'react-router-dom';
import {
	CreatePlanification,
	DashboardCoordinator,
	EditPlanification,
	PerformanceConsolited,
	AcademicAssigmentReport,
} from '../pages';
import { Planification } from '../../shared/planifications';
import React from 'react';
import { RedirectToDefaultDepartment } from './redirects/RedirectToDeafultDeparment';

const CreateUserLazy = React.lazy(() =>
	import('../../shared/users/pages/CreateUser').then(module => ({
		default: module.CreateUser,
	}))
);

export const coordinatorsRoutes: RouteObject[] = [
	// {
	// 	path: 'coordinadores',
	// 	element: <UsersCoordinator />,
	// },
	{
		path: 'dashboard-coordinador',
		element: <RedirectToDefaultDepartment />,
	},
	{
		path: 'dashboard-coordinador/:centerDepartmentId',
		element: <DashboardCoordinator />,
		// loader: ({ params }) => {
		// 	if (!params.centerDepartmentId) {
		// 		throw redirect('/coordinadores');
		// 	}
		//
		// 	return null;
		// },
	},
	{
		path: 'crear-planificacion/:centerDepartmentId',
		element: <CreatePlanification />,
	},
	{
		path: 'editar-planificacion',
		element: <EditPlanification />,
	},
	{
		path: 'datos-planificacion',
		element: <Planification />,
	},
	{
		path: 'consolidado-rendimiento',
		element: <PerformanceConsolited />,
	},
	{
		path: 'informe-asignación-académica/:id',
		element: <AcademicAssigmentReport />,
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
		path: '*',
		element: <Navigate to="/coordinadores" replace />,
	},
];
