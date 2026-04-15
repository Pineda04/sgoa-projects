export const departmentKeys = {
	all: ['departments'] as const,
	detail: (id: string) => [...departmentKeys.all, 'detail', id] as const,
};
