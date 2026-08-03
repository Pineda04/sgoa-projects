import { TCheckFilters, TReportFilters } from './monitor.types';

export const monitorKeys = {
	all: ['monitor'] as const,
	currentAssignments: (email?: string) =>
		[...monitorKeys.all, 'current-assignments', email ?? ''] as const,
	buildings: () => [...monitorKeys.all, 'buildings'] as const,
	checks: (page: number, size: number, filters?: TCheckFilters) =>
		[...monitorKeys.all, 'checks', page, size, filters ?? {}] as const,
	report: (filters?: TReportFilters) =>
		[...monitorKeys.all, 'report', filters ?? {}] as const,
};
