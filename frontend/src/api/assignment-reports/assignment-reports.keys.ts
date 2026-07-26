export const academicAssignmentReportsKeys = {
	all: ['academic-assignment-reports'] as const,
	report: (reportId: string) =>
		[...academicAssignmentReportsKeys.all, 'report', reportId] as const,
	lists: () => [...academicAssignmentReportsKeys.all, 'list'] as const,
	periods: () => [...academicAssignmentReportsKeys.all, 'periods'] as const,
	period: (periodId: string) =>
		[...academicAssignmentReportsKeys.all, 'period', periodId] as const,
	periodCenter: (periodId: string, centerDepartmentId: string) =>
		[
			...academicAssignmentReportsKeys.all,
			'period',
			periodId,
			'center',
			centerDepartmentId,
		] as const,
};

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
		teacherId: string,
		year?: string,
		pac?: string,
		teacherName?: string
	) =>
		[
			...academicAssignmentCoordinatorKeys.all,
			'period-center-teacher',
			periodId,
			centerDepartmentId,
			teacherId,
			year ?? '',
			pac ?? '',
			teacherName ?? '',
		] as const,
	periodPage: (page: number, size: number) =>
		[
			...academicAssignmentCoordinatorKeys.onlyPeriods,
			'page',
			page,
			'size',
			size,
		] as const,
	periodPageCenter: (
		page: number,
		centerDepartmentId: string,
		year?: string,
		pac?: string
	) =>
		[
			...academicAssignmentCoordinatorKeys.onlyPeriods,
			'page',
			page,
			'center',
			centerDepartmentId,
			year ?? '',
			pac ?? '',
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

export const academicAssignmentAuthoritiesKeys = {
	all: ['academic-assignment-authorities'] as const,
	periods: (
		page: number,
		size: number,
		year?: string,
		pac?: string,
		departmentId?: string,
		centerId?: string
	) =>
		[
			...academicAssignmentAuthoritiesKeys.all,
			'periods',
			page,
			size,
			year ?? '',
			pac ?? '',
			departmentId ?? '',
			centerId ?? '',
		] as const,
	reports: (
		page: number,
		size: number,
		year?: string,
		pac?: string,
		departmentId?: string,
		centerId?: string,
		teacherName?: string
	) =>
		[
			...academicAssignmentAuthoritiesKeys.all,
			'reports',
			page,
			size,
			year ?? '',
			pac ?? '',
			departmentId ?? '',
			centerId ?? '',
			teacherName ?? '',
		] as const,
};
