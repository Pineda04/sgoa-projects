import { Navigate, RouteObject } from 'react-router-dom';
import { CourseEdit } from '../components/CourseEdit';
import { CreateCourse } from '../pages/CreateCourse';

export const coursesRoutes: RouteObject[] = [
	{
		index: true,
		element: <Navigate to="/home" replace />,
	},
	{
		path: 'nuevo',
		element: <CreateCourse />,
	},
	{
		path: ':id',
		element: <CourseEdit />,
	},
	{
		path: '*',
		element: <Navigate to="/home" replace />,
	},
];
