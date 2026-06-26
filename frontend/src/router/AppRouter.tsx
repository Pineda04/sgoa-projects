import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
} from 'react-router-dom';
import { AuthRouter, authRoutes } from '@features/auth';
import { homeRoutes } from '@features/others/home';
import { helpRoutes } from '@features/others/help/routes';
import { usersRoutes } from '@features/admin/users/routes';
import { periodsRoutes } from '@features/academic/periods/routes';
import { coursesRoutes } from '@features/academic/courses/routes';
import { planificationsRoutes } from '@features/academic/planifications/routes';
import { reportsRoutes } from '@features/academic/reports/routes';
import { centersRoutes } from '@features/infrastructure/centers/routes';
import { PrivateRoute } from './PrivateRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { dashboardRoutes } from '@features/dashboard';

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
			path: 'dashboard/*',
			element: <PrivateRoute />,
			children: dashboardRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/courses/*',
			element: <ProtectedRoute action="read" subject="academic-module" />,
			children: coursesRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/periods',
			element: <ProtectedRoute action="read" subject="academic-module" />,
			children: periodsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/planifications/*',
			element: <ProtectedRoute action="read" subject="academic-module" />,
			children: planificationsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/reports/*',
			element: <ProtectedRoute action="read" subject="academic-module" />,
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
			path: 'infrastructure/centers',
			element: <ProtectedRoute action="read" subject="centers" />,
			children: centersRoutes,
			errorElement: <div>404</div>,
		},
	],
	{
		basename: process.env.NODE_ENV === 'development' ? '/' : '/',
	}
);

export const AppRouter = () => {
	return <RouterProvider router={router} />;
};
