export const academicAssignmentReportKeys = {
	all: ['academic-assignment-reports'] as const,
	report: (reportId: string) =>
		[...academicAssignmentReportKeys.all, 'report', reportId] as const,
	lists: () => [...academicAssignmentReportKeys.all, 'list'] as const,
	periods: () => [...academicAssignmentReportKeys.all, 'periods'] as const,
	period: (periodId: string) =>
		[...academicAssignmentReportKeys.all, 'period', periodId] as const,
	periodCenter: (periodId: string, centerDepartmentId: string) =>
		[
			...academicAssignmentReportKeys.all,
			'period',
			periodId,
			'center',
			centerDepartmentId,
		] as const,
};
