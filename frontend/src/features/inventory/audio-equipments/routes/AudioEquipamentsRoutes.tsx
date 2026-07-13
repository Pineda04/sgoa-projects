import { Navigate, type RouteObject } from 'react-router-dom';
import { AudioEquipmentsRouter } from './AudioEquipamentsRouter';
import { ListAudioEquipments } from '../pages';

export const audioEquipmentsRoutes: RouteObject[] = [
	{
		path: '',
		element: <AudioEquipmentsRouter />,
		children: [
			{
				index: true,
				element: <ListAudioEquipments />,
			},
			{
				path: '*',
				element: <Navigate to="/inventory/audio-equipments" replace />,
			},
		],
	},
];
