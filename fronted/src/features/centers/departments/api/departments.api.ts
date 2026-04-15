import { TCoordinator } from '@features/coordinators';
import { api } from '@lib/api/axios';
import { IResponse } from '@types';
import { TDepartment } from '../types';

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
};
