import { Navigate, type RouteObject } from 'react-router-dom';
import { DigitalBlackboardsRouter } from './DigitalBlackboardsRouter';
import { ListDigitalBlackboards } from '../pages';

export const digitalBlackboardsRoutes: RouteObject[] = [
	{
		path: '',
		element: <DigitalBlackboardsRouter />,
		children: [
			{
				index: true,
				element: <ListDigitalBlackboards />,
			},
			{
				path: '*',
				element: (
					<Navigate to="/inventory/digital-blackboards" replace />
				),
			},
		],
	},
];
