import { TCheckFilters, TReportFilters } from './monitor.types';

export const monitorKeys = {
	all: ['monitor'] as const,
	currentAssignments: () => [...monitorKeys.all, 'current-assignments'] as const,
	buildings: () => [...monitorKeys.all, 'buildings'] as const,
	checks: (page: number, size: number, filters?: TCheckFilters) =>
		[...monitorKeys.all, 'checks', page, size, filters ?? {}] as const,
	report: (filters?: TReportFilters) =>
		[...monitorKeys.all, 'report', filters ?? {}] as const,
};
