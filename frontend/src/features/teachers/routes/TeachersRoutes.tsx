import { Navigate, type RouteObject } from 'react-router-dom';
import { DashboardTeacher, AcademicAssignmentReport } from '../pages';

export const teachersRoutes: RouteObject[] = [
	{
		path: '',
		element: <Navigate to="dashboard" replace />,
	},
	{
		path: 'dashboard',
		element: <DashboardTeacher />,
	},
	{
		path: 'informe-asignación-académica/:id',
		element: <AcademicAssignmentReport />,
	},
	// {
	//   path: "editar-informe-actividades",
	//   element: <EditReport />,
	// },
	{
		path: '*',
		element: <Navigate to="/docentes" replace />,
	},
];
