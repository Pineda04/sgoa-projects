import { TScheduleCheck } from './monitor.types';
import { IResponse } from '@shared/interfaces';
import { api } from '@config/lib';

export const monitorApi = {
	getScheduleChecks: (page: number, size: number) =>
		api.get<IResponse<TScheduleCheck[]>>(`/monitor/schedule-checks?page=${page}&size=${size}`),

	getScheduleCheckById: (id: string) =>
		api.get<IResponse<TScheduleCheck>>(`/monitor/schedule-checks/${id}`),

	createScheduleCheck: (body: Omit<TScheduleCheck, 'id' | 'checkedAt' | 'monitorId'>) =>
		api.post<IResponse<TScheduleCheck>>('/monitor/schedule-checks', body),
};
