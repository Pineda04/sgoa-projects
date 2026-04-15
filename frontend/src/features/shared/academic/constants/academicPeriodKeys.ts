export const academicPeriodKeys = {
	all: ['academic-periods'] as const,
	lists: () => [...academicPeriodKeys.all, 'list'] as const,
	list: (page: number) => [...academicPeriodKeys.lists(), { page }] as const,
	details: () => [...academicPeriodKeys.all, 'detail'] as const,
	detail: (id: string) => [...academicPeriodKeys.details(), id] as const,
	current: () => [...academicPeriodKeys.all, 'current'] as const,
	next: () => [...academicPeriodKeys.all, 'next'] as const,
};
