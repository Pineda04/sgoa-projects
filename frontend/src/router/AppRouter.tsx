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
import { PublicRoute } from './PublicRoute';
import { dashboardsRoutes } from '@features/academic/dashboards';

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
			path: 'academic/courses/*',
			element: <PrivateRoute />,
			children: coursesRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/dashboards/*',
			element: <PrivateRoute />,
			children: dashboardsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/periods',
			element: <PrivateRoute />,
			children: periodsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/planifications/*',
			element: <PrivateRoute />,
			children: planificationsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'academic/reports/*',
			element: <PrivateRoute />,
			children: reportsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'admin/users/*',
			element: <PrivateRoute />,
			children: usersRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'infrastructure/centers',
			element: <PrivateRoute />,
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
