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
};
