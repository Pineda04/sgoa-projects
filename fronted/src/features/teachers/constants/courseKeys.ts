export const courseKeys = {
	all: ['courses'] as const,
	detail: (id: string) => [...courseKeys.all, 'detail', id] as const,
	page: (page: number) => [...courseKeys.all, 'page', page] as const,
	current: () => ['courses-current'] as const,
	period: (periodId: string) =>
		[...courseKeys.all, 'period', periodId] as const,
	periodCenter: (periodId: string, centerDepartmentId: string) =>
		[
			...courseKeys.all,
			'period',
			periodId,
			'center',
			centerDepartmentId,
		] as const,
};
