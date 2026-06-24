import React from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { ListDepartments } from '../pages';

const CreateDepartmentLazy = React.lazy(() =>
    import('../pages/CreateDepartment').then(module => ({
        default: module.CreateDepartment,
    }))
);

export const departmentsRoutes: RouteObject[] = [
    {
        path: '',
        element: <ListDepartments />
    },
    {
        path: 'new',
        element: (
            <React.Suspense fallback={<div>Cargando...</div>}>
                <CreateDepartmentLazy />
            </React.Suspense>
        ),
    },
    {
        path: '*',
        element: <Navigate to={'/admin/departments'} replace />
    },

]