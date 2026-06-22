import { api } from '@config/lib';
import { IResponse } from '@shared';
import { TAcademicCommonProps } from "../periods/periods.types";

export const positionsApi = {
	getAllPositions: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/positions`),
};
