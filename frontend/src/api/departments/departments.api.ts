import { api } from '@config';
import { TDepartment, TOutputDepartment } from './departments.types';
import { IResponse } from '@shared';
import { TCoordinator } from '../teachers';
import { TCreateDepartment, TUpdateDepartment } from '@features/admin';

export const departmentsApi = {
	getAllDepartments: () =>
		api.get<
			IResponse<
				(TDepartment & {
					coordinations: {
						centerDepartmentId: string;
						centerId: string;
						centerName: string;
						coordinator: TCoordinator;
					}[];
				})[]
			>
		>(`/departments`),

	//este endpoint en el BE no retorna paginacion y es usado en /admin/departments
	getAllDepartmentsForTable: () =>
		api.get<IResponse<TOutputDepartment[]>>(`/departments`),

	createDepartment: (body: TCreateDepartment) =>
		api.post<IResponse<TDepartment>>(`/departments`, body),

	getOneDepartment: (id: string) =>
		api.get<IResponse<TDepartment>>(`/departments/${id}`),

	updateDepartment: ({ id, body }: { id: string, body: TUpdateDepartment }) =>
		api.patch<IResponse<TDepartment>>(`/departments/${id}`, body),

	deleteDepartment: (id: string) =>
		api.delete<IResponse<TDepartment>>(`/departments/${id}`),

};
