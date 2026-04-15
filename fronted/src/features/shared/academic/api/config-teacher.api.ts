import { TAcademicCommonProps } from '@features/teachers';
import { api } from '@lib/api/axios';
import { IResponse } from '@types';

export const configTeacherApi = {
	// ContractTypes
	getAllContractTypes: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/contract-types`),

	// TeacherCategories
	getAllTeacherCategories: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/teacher-categories`),

	// Shifts
	getAllShifts: () => api.get<IResponse<TAcademicCommonProps[]>>(`/shifts`),

	// Positions
	getAllPositions: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/positions`),
};
