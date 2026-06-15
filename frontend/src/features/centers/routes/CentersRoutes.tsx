import { Navigate, type RouteObject } from 'react-router-dom';
import React from 'react';

const ListCentersLazy = React.lazy(() =>
    import('../pages').then(module => ({ default: module.ListCenters }))
);

const CreateCenterLazy = React.lazy(() =>
    import('../pages').then(module => ({ default: module.CreateCenter }))
);

const EditCenterLazy = React.lazy(() =>
    import('../pages').then(module => ({ default: module.EditCenter }))
);

export const centersRoutes: RouteObject[] = [
    {
        path: '',
        element: (
            <React.Suspense fallback={<div>Cargando lista...</div>}>
                <ListCentersLazy />
            </React.Suspense>
        ),
    },
    {
        path: 'nuevo',
        element: (
            <React.Suspense fallback={<div>Cargando formulario...</div>}>
                <CreateCenterLazy />
            </React.Suspense>
        ),
    },
    {
        path: 'editar/:id',
        element: (
            <React.Suspense fallback={<div>Cargando editor...</div>}>
                <EditCenterLazy />
            </React.Suspense>
        ),
    },
    {
        path: '*',
        element: <Navigate to="" replace />,
    },
];