import { TAcademicCommonProps } from '@features/teachers';
import { api } from '@lib/api/axios';
import { IResponse } from '@types';
import { TDepartment } from '../departments';
import { TCenter } from '../types';

export const centersApi = {
	getAllCenters: () => api.get<IResponse<TAcademicCommonProps[]>>(`/centers`),
	getCenterById: (id: string) =>
		api.get<
			IResponse<
				TCenter & {
					departments: (Pick<TDepartment, 'id' | 'name'> & {
						centerDepartmentId: string;
					})[];
				}
			>
		>(`/centers/${id}`),

	createCenter: (data: { name: string }) =>
		api.post<IResponse<TCenter>>(`/centers`, data),

	updateCenter: (id: string, data: { name: string }) =>
		api.patch<IResponse<TCenter>>(`/centers/${id}`, data),

	deleteCenter: (id: string) =>
		api.delete<IResponse<void>>(`/centers/${id}`),
};
