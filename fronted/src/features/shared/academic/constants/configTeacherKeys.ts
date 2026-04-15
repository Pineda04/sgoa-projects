// ContractTypes
export const contractTypeKeys = {
	all: ['contract-types'] as const,
	detail: (id: string) => [...contractTypeKeys.all, 'detail', id] as const,
	page: (page: number) => [...contractTypeKeys.all, 'page', page] as const,
};

// TeacherCategories
export const teacherCategoryKeys = {
	all: ['teacher-categories'] as const,
	detail: (id: string) => [...teacherCategoryKeys.all, 'detail', id] as const,
	page: (page: number) => [...teacherCategoryKeys.all, 'page', page] as const,
};

// Shifts
export const shiftKeys = {
	all: ['shifts'] as const,
	detail: (id: string) => [...shiftKeys.all, 'detail', id] as const,
	page: (page: number) => [...shiftKeys.all, 'page', page] as const,
};

// Positions
export const positionKeys = {
	all: ['positions'] as const,
	detail: (id: string) => [...positionKeys.all, 'detail', id] as const,
	page: (page: number) => [...positionKeys.all, 'page', page] as const,
};
