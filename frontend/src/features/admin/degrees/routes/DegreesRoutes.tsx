import { Navigate, type RouteObject } from 'react-router-dom';
import { DegreesRouter } from './DegreesRouter';
import { ListDegrees } from '../pages';

export const degreesRoutes: RouteObject[] = [
    {
        path: '',
        element: <DegreesRouter />,
        children: [
            {
                index: true,
                element: <ListDegrees />,
            },
            {
                path: '*',
                element: <Navigate to="/admin/degrees" replace />,
            },
        ],
    },
];
