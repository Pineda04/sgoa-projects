import {
	TCheckFilters,
	TCreateCheck,
	TMonitorBuilding,
	TMonitorBuildingAssignments,
	TMonitorReport,
	TReportFilters,
	TScheduleComplianceCheck,
	TScheduleComplianceCheckDetail,
	TUpdateCheck,
} from './monitor.types';
import { IResponse } from '@shared/interfaces';
import { api } from '@config/lib';

const buildCheckFiltersParams = (filters?: TCheckFilters) => {
	const params = new URLSearchParams();
	if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
	if (filters?.dateTo) params.set('dateTo', filters.dateTo);
	if (filters?.teacherId) params.set('teacherId', filters.teacherId);
	if (filters?.buildingId) params.set('buildingId', filters.buildingId);
	if (filters?.centerId) params.set('centerId', filters.centerId);
	if (filters?.periodId) params.set('periodId', filters.periodId);
	if (filters?.centerDepartmentId)
		params.set('centerDepartmentId', filters.centerDepartmentId);
	return params;
};

export const monitorApi = {
	getCurrentAssignments: () =>
		api.get<IResponse<TMonitorBuildingAssignments[]>>(
			'/monitor/current-assignments'
		),

	getBuildings: () =>
		api.get<IResponse<TMonitorBuilding[]>>('/monitor/buildings'),

	createCheck: (body: TCreateCheck) =>
		api.post<IResponse<TScheduleComplianceCheck>>('/monitor/checks', body),

	updateCheck: ({ id, ...body }: TUpdateCheck) =>
		api.patch<IResponse<TScheduleComplianceCheck>>(
			`/monitor/checks/${id}`,
			body
		),

	/**
	 * Sincroniza en bloque los checks registrados localmente sin conexión.
	 * El endpoint siempre responde 200; los conflictos se reportan en la
	 * respuesta para que el cliente marque solo los realmente persistidos.
	 */
	batchSync: (body: { checks: TCreateCheck[] }) =>
		api.post<
			IResponse<{
				synced: number;
				conflicts: number;
				skipped: number;
				rejected: number;
				conflictIds: string[];
				skippedIds: string[];
				rejectedIds: string[];
			}>
		>('/monitor/checks/batch-sync', body),

	getChecks: (page: number, size: number, filters?: TCheckFilters) => {
		const params = buildCheckFiltersParams(filters);
		params.set('page', String(page));
		params.set('size', String(size));
		return api.get<IResponse<TScheduleComplianceCheckDetail[]>>(
			`/monitor/checks?${params.toString()}`
		);
	},

	getComplianceReport: (filters?: TReportFilters) => {
		const params = buildCheckFiltersParams(filters);
		if (filters?.groupBy) params.set('groupBy', filters.groupBy);
		return api.get<IResponse<TMonitorReport>>(
			`/monitor/checks/report?${params.toString()}`
		);
	},
};
