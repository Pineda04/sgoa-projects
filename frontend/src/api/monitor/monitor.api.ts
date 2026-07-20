import {
	TCreateCheck,
	TMonitorBuildingAssignments,
	TScheduleComplianceCheck,
} from './monitor.types';
import { IResponse } from '@shared/interfaces';
import { api } from '@config/lib';

export const monitorApi = {
	getCurrentAssignments: () =>
		api.get<IResponse<TMonitorBuildingAssignments[]>>('/monitor/current-assignments'),

	createCheck: (body: TCreateCheck) =>
		api.post<IResponse<TScheduleComplianceCheck>>('/monitor/checks', body),
};
