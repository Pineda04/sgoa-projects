import { api } from '@config/lib';
import { IResponse } from '@shared';
import { TCreateAcademicPeriodDto, TCurrentAcademicPeriod, TPacModality, TUpdateAcademicPeriodDto } from "./periods.types";

export const academicPeriodsApi = {
	getCurrentAcademicPeriod: () =>
		api.get<IResponse<TCurrentAcademicPeriod>>(`/academic-periods/current`),

	getAcademicPeriods: () =>
		api.get<IResponse<TCurrentAcademicPeriod[]>>(`/academic-periods`),

	getAcademicPeriodNextToCreate: (modality: TPacModality = 'Trimestre') =>
		api.get<IResponse<TCurrentAcademicPeriod>>(
			`/academic-periods/next-to-create?modality=${modality}`
		),

	createAcademicPeriod: (data: TCreateAcademicPeriodDto) =>
		api.post<IResponse<TCurrentAcademicPeriod>>(`/academic-periods`, data),

	updateAcademicPeriod: (id: string, data: TUpdateAcademicPeriodDto) =>
		api.patch<IResponse<TCurrentAcademicPeriod>>(`/academic-periods/${id}`, data),

	deleteAcademicPeriod: (id: string) =>
		api.delete<IResponse<void>>(`/academic-periods/${id}`),
};
