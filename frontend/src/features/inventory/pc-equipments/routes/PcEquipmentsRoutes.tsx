import { Navigate, type RouteObject } from 'react-router-dom';
import { PcEquipmentsRouter } from './PcEquipmentsRouter';
import { ListPcEquipments } from '../pages';

export const pcEquipmentsRoutes: RouteObject[] = [
	{
		path: '',
		element: <PcEquipmentsRouter />,
		children: [
			{
				index: true,
				element: <ListPcEquipments />,
			},
			{
				path: '*',
				element: <Navigate to="/inventory/pc-equipments" replace />,
			},
		],
	},
];
