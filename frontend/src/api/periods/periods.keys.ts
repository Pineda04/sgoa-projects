export const academicPeriodsKeys = {
	all: ['academic-periods'] as const,
	lists: (year?: string, pac?: string, modality?: string) =>
		[...academicPeriodsKeys.all, 'list', year ?? '', pac ?? '', modality ?? ''] as const,
	list: (page: number) => [...academicPeriodsKeys.lists(), { page }] as const,
	details: () => [...academicPeriodsKeys.all, 'detail'] as const,
	detail: (id: string) => [...academicPeriodsKeys.details(), id] as const,
	current: () => [...academicPeriodsKeys.all, 'current'] as const,
	next: () => [...academicPeriodsKeys.all, 'next'] as const,
};
