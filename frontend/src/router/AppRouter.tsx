import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
} from 'react-router-dom';
import { AuthRouter, authRoutes } from '@features/auth';
import { homeRoutes } from '@features/others/home';
import { helpRoutes } from '@features/others/help/routes';
import { usersRoutes } from '@features/admin/users/routes';
import {
	departmentsRoutes,
	degreesRoutes,
	positionsRoutes,
	facultiesRoutes,
	rolesRoutes,
} from '@features/admin';
import { coursesRoutes } from '@features/academic/courses/routes';
import { planificationsRoutes } from '@features/academic/planifications/routes';
import { reportsRoutes } from '@features/academic/reports/routes';
import { AcademicAssignmentReport, MonitorReport } from '@features/academic/reports/pages';
import { centersRoutes } from '@features/infrastructure/centers/routes';
import { pcEquipmentsRoutes } from '@features/inventory/pc-equipments/routes';
import { PrivateRoute } from './PrivateRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import {
	DashboardAuthorities,
	DashboardCoordinator,
	DashboardMonitor,
	DashboardTeacher,
	RedirectToDefaultDepartment,
} from '@features/dashboard';
import { buildingsRoutes } from '@features/infrastructure/buildings/routes/BuildingsRoutes';
import { classroomsRoutes } from '@features/infrastructure/classrooms/routes';
import { airConditionersRoutes, digitalBlackboardsRoutes } from '@features/inventory';
import { catalogRoutes } from '@features/others';



const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <Navigate to={'/home'} replace />,
		},
		{
			path: 'auth/*',
			element: (
				<PublicRoute>
					<AuthRouter />
				</PublicRoute>
			),
			children: authRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'home',
			element: <PrivateRoute />,
			children: homeRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'help',
			element: <PrivateRoute />,
			children: helpRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'catalog',
			element: <ProtectedRoute action="read" subject="catalog" />,
			children: catalogRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'dashboard/authorities',
			element: <ProtectedRoute action="read" subject="dashboard-authorities" />,
			children: [{ index: true, element: <DashboardAuthorities /> }],
			errorElement: <div>404</div>,
		},
		{
			path: 'dashboard/coordinator',
			element: <ProtectedRoute action="read" subject="dashboard-coordinator" />,
			children: [{ index: true, element: <RedirectToDefaultDepartment /> }],
			errorElement: <div>404</div>,
		},
		{
			path: 'dashboard/coordinator/:centerDepartmentId',
			element: <ProtectedRoute action="read" subject="dashboard-coordinator" />,
			children: [{ index: true, element: <DashboardCoordinator /> }],
			errorElement: <div>404</div>,
		},
		{
			path: 'dashboard/teacher',
			element: <ProtectedRoute action="read" subject="dashboard-teacher" />,
			children: [{ index: true, element: <DashboardTeacher /> }],
			errorElement: <div>404</div>,
		},
		{
			path: 'dashboard/monitor',
			element: <ProtectedRoute action="read" subject="dashboard-monitor" />,
			children: [{ index: true, element: <DashboardMonitor /> }],
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/courses/*',
			element: <ProtectedRoute action="read" subject="courses" />,
			children: coursesRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/planifications/*',
			element: <ProtectedRoute action="read" subject="planifications" />,
			children: planificationsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/reports/teacher/:id',
			element: <ProtectedRoute action="read" subject="dashboard-teacher" />,
			children: [{ index: true, element: <AcademicAssignmentReport /> }],
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/reports/monitor',
			element: <ProtectedRoute action="read" subject="reports-monitor" />,
			children: [{ index: true, element: <MonitorReport /> }],
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/reports/*',
			element: <ProtectedRoute action="read" subject="reports" />,
			children: reportsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'admin/users/*',
			element: <ProtectedRoute action="read" subject="users" />,
			children: usersRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'admin/departments/*',
			element: <ProtectedRoute action="read" subject="departments" />,
			children: departmentsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'admin/faculties/*',
			element: <ProtectedRoute action="read" subject="faculties" />,
			children: facultiesRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'admin/degrees/*',
			element: <ProtectedRoute action="read" subject="degrees" />,
			children: degreesRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'admin/positions/*',
			element: <ProtectedRoute action="read" subject="positions" />,
			children: positionsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'admin/roles/*',
			element: <ProtectedRoute superAdminOnly />,
			children: rolesRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'infrastructure/centers',
			element: <ProtectedRoute action="read" subject="centers" />,
			children: centersRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'infrastructure/buildings',
			element: <ProtectedRoute action="read" subject="buildings" />,
			children: buildingsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'infrastructure/classrooms/*',
			element: <ProtectedRoute action="read" subject="classrooms" />,
			children: classroomsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'inventory/pc-equipments/*',
			element: <ProtectedRoute action="read" subject="pc-equipments" />,
			children: pcEquipmentsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'inventory/air-conditioners/*',
			element: <ProtectedRoute action='read' subject='air-conditioners' />,
			children: airConditionersRoutes,
			errorElement: <div>404</div>
		},
		{
			path: 'inventory/digital-blackboards/*',
			element: <ProtectedRoute action="read" subject="digital-blackboards" />,
			children: digitalBlackboardsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: '*',
			element: <Navigate to="/home" replace />,
		},
	],
	{
		basename: process.env.NODE_ENV === 'development' ? '/' : '/',
	}
);

export const AppRouter = () => {
	return <RouterProvider router={router} />;
};
