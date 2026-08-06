import { Navigate, type RouteObject } from 'react-router-dom';
import { AirConditionersRouter } from './AirConditionersRouter';
import { ListAirConditioners } from '../pages';

export const airConditionersRoutes: RouteObject[] = [
	{
		path: '',
		element: <AirConditionersRouter />,
		children: [
			{
				index: true,
				element: <ListAirConditioners />,
			},
			{
				path: '*',
				element: <Navigate to="/inventory/air-conditioners" replace />,
			},
		],
	},
];
