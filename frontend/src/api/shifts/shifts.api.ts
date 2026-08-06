import { api } from '@config/lib';
import { IResponse } from '@shared';
import { TAcademicCommonProps } from '../periods/periods.types';

// Turnos
export const shiftsApi = {
	getAllShifts: () => api.get<IResponse<TAcademicCommonProps[]>>(`/shifts`),

	createShift: (body: { name: string }) =>
		api.post<IResponse<TAcademicCommonProps>>(`/shifts`, body),

	updateShift: ({ id, body }: { id: string; body: { name: string } }) =>
		api.patch<IResponse<TAcademicCommonProps>>(`/shifts/${id}`, body),

	deleteShift: (id: string) => api.delete<IResponse<void>>(`/shifts/${id}`),
};
