export const academicAssignmentCoordinatorKeys = {
	all: ['academic-assignment-coordinator'] as const,
	onlyPeriods: ['academic-assignment-coordinator-periods'] as const,
	period: (periodId: string) =>
		[...academicAssignmentCoordinatorKeys.all, 'period', periodId] as const,
	periodCenter: (periodId: string, centerDepartmentId: string) =>
		[
			...academicAssignmentCoordinatorKeys.all,
			'period-center',
			periodId,
			centerDepartmentId,
		] as const,
	periodCenterTeacher: (
		periodId: string,
		centerDepartmentId: string,
		teacherId: string
	) =>
		[
			...academicAssignmentCoordinatorKeys.all,
			'period-center-teacher',
			periodId,
			centerDepartmentId,
			teacherId,
		] as const,
	periodPage: (page: number, size: number) =>
		[
			...academicAssignmentCoordinatorKeys.onlyPeriods,
			'page',
			page,
			'size',
			size,
		] as const,
	periodPageCenter: (page: number, centerDepartmentId: string) =>
		[
			...academicAssignmentCoordinatorKeys.onlyPeriods,
			'page',
			page,
			'center',
			centerDepartmentId,
		] as const,
	search: (searchTerm: string, page: number) =>
		[
			...academicAssignmentCoordinatorKeys.all,
			'search',
			searchTerm,
			page,
		] as const,
	searchCenterDepartment: (
		centerDepartmentId: string,
		searchTerm: string,
		page: number
	) =>
		[
			...academicAssignmentCoordinatorKeys.all,
			'search',
			centerDepartmentId,
			searchTerm,
			page,
		] as const,
};
