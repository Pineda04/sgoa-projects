// Docentes
export const teachersKeys = {
	all: ['teacher'] as const,
	lists: () => [...teachersKeys.all, 'list'] as const,
	list: (page: number) => [...teachersKeys.lists(), { page }] as const,
	autocomplete: (searchTerm: string) =>
		[...teachersKeys.all, 'autocomplete', searchTerm] as const,
	details: () => [...teachersKeys.all, 'detail'] as const,
	detail: (id: string) => ['teacher-detail', id] as const,
	position: () => [...teachersKeys.all, 'position'] as const,
	coordinator: (
		page: number = 1,
		size: number,
		centerDepartmentId?: string,
		filters?: Record<string, string | undefined>
	) =>
		[
			...teachersKeys.all,
			'coordinator',
			{ page, size, centerDepartmentId, ...filters },
		] as const,
};

// Coordinadores
export const coordinatorsKeys = {
	all: ['coordinators'] as const,
	lists: () => [...coordinatorsKeys.all, 'list'] as const,
	list: (page: number) => [...coordinatorsKeys.all, { page }] as const,
	my: ['coordinations'] as const,
};

// Categorías de Docentes
export const teacherCategoriesKeys = {
	all: ['teacher-categories'] as const,
	detail: (id: string) => [...teacherCategoriesKeys.all, 'detail', id] as const,
	page: (page: number) => [...teacherCategoriesKeys.all, 'page', page] as const,
};
