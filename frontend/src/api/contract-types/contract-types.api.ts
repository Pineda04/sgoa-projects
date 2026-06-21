import { TAcademicCommonProps } from '../periods/periods.types';
import { IResponse } from '@shared';
import { api } from '@config';

// Tipos Contratos
export const contractTypesApi = {
	getAllContractTypes: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/contract-types`),
};
