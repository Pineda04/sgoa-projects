export const teacherKeys = {
	all: ['teacher'] as const,
	lists: () => [...teacherKeys.all, 'list'] as const,
	list: (page: number) => [...teacherKeys.lists(), { page }] as const,
	details: () => [...teacherKeys.all, 'detail'] as const,
	detail: (id: string) => ['teacher-detail', id] as const,
	position: () => [...teacherKeys.all, 'position'] as const,
	coordinator: (
		page: number = 1,
		size: number,
		centerDepartmentId?: string
	) =>
		[
			...teacherKeys.all,
			'coordinator',
			{ page, size, centerDepartmentId },
		] as const,
};
