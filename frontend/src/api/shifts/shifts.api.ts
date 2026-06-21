import { api } from '@config/lib';
import { IResponse } from '@shared';
import { TAcademicCommonProps } from "../periods/periods.types";

// Turnos
export const shiftsApi = {
	getAllShifts: () => api.get<IResponse<TAcademicCommonProps[]>>(`/shifts`),
};
