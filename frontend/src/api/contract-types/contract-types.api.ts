import { TAcademicCommonProps } from '../periods/periods.types';
import { IResponse } from '@shared';
import { api } from '@config';

// Tipos Contratos
export const contractTypesApi = {
	getAllContractTypes: () =>
		api.get<IResponse<TAcademicCommonProps[]>>(`/contract-types`),

	createContractType: (body: { name: string }) =>
		api.post<IResponse<TAcademicCommonProps>>(`/contract-types`, body),

	updateContractType: ({
		id,
		body,
	}: {
		id: string;
		body: { name: string };
	}) =>
		api.patch<IResponse<TAcademicCommonProps>>(
			`/contract-types/${id}`,
			body
		),

	deleteContractType: (id: string) =>
		api.delete<IResponse<void>>(`/contract-types/${id}`),
};
