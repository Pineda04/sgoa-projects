import { api } from '@config';
import { TDepartment } from './departments.types';
import { IResponse } from '@shared';
import { TCoordinator } from '../teachers';

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
