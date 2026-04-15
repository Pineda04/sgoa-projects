import { TCurrentAcademicPeriod, TPacModality } from '@features/teachers';
import { api } from '@lib/api/axios';
import { IResponse } from '@types';

export const academicPeriodsApi = {
	getCurrentAcademicPeriod: () =>
		api.get<IResponse<TCurrentAcademicPeriod>>(`academic-periods/current`),

	getAcademicPeriods: () =>
		api.get<IResponse<TCurrentAcademicPeriod[]>>(`/academic-periods`),

	getAcademicPeriodNextToCreate: (modality: TPacModality = 'Trimestre') =>
		api.get<IResponse<TCurrentAcademicPeriod>>(
			`academic-periods/next-to-create?modality=${modality}`
		),
};
