export const departmentsKeys = {
	all: ['departments'] as const,
	detail: (id: string) => [...departmentsKeys.all, 'detail', id] as const,
};
