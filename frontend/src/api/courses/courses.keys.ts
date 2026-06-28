export const coursesKeys = {
	all: ['courses'] as const,
	detail: (id: string) => [...coursesKeys.all, 'detail', id] as const,
	page: (page: number) => [...coursesKeys.all, 'page', page] as const,
	current: () => ['courses-current'] as const,
	period: (periodId: string) =>
		[...coursesKeys.all, 'period', periodId] as const,
	periodCenter: (periodId: string, centerDepartmentId: string) =>
		[
			...coursesKeys.all,
			'period',
			periodId,
			'center',
			centerDepartmentId,
		] as const,
};
