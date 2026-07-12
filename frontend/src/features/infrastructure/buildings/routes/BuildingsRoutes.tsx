import { Navigate, type RouteObject } from 'react-router-dom';
import { ListBuildings } from '../pages'; 

export const buildingsRoutes: RouteObject[] = [
    {
        path: '',
        element: <ListBuildings /> 
    },
    {
        path: '*',
        element: <Navigate to={'/infrastructure/buildings'} replace />
    },
];