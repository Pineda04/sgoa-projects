import { AuthRouter, authRoutes } from '@features/auth';
import { authoritiesRoutes } from '@features/authorities';
import { coordinatorsRoutes } from '@features/coordinators';
import { homeRoutes } from '@features/home';
import { othersRoutes } from '@features/others';
import { rrhhRoutes } from '@features/rrhh';
import { teachersRoutes } from '@features/teachers';
import {
	createBrowserRouter,
	Navigate,
	RouterProvider,
} from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import { usersRoutes } from '@features/shared/users/routes';
import { coursesRoutes } from '@features/shared/courses/routes/CoursesRoutes';
import { positionsRoutes } from '@features/admin';

const router = createBrowserRouter(
	[
		{
			path: '/',
			element: <Navigate to={'/home'} replace />, // Se debe diferente
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
			path: 'docentes',
			element: <PrivateRoute />,
			children: teachersRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'coordinadores',
			element: <PrivateRoute />,
			children: coordinatorsRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'autoridades',
			element: <PrivateRoute />,
			children: authoritiesRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'otros',
			element: <PrivateRoute />,
			children: othersRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: 'home',
			element: <PrivateRoute />,
			children: homeRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: '/rrhh',
			element: <PrivateRoute />,
			children: rrhhRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: '/usuarios',
			element: <PrivateRoute />,
			children: usersRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: '/clases',
			element: <PrivateRoute />,
			children: coursesRoutes,
			errorElement: <div>404</div>,
		},
		{
			path: '/admin',
			element: <PrivateRoute />,
			children: positionsRoutes,
			errorElement: <div>404</div>,
		}
	],
	{
		basename: process.env.NODE_ENV === 'development' ? '/' : '/',
	}
);

export const AppRouter = () => {
	return <RouterProvider router={router} />;
};
