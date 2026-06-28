export const shiftsKeys = {
	all: ['shifts'] as const,
	detail: (id: string) => [...shiftsKeys.all, 'detail', id] as const,
	page: (page: number) => [...shiftsKeys.all, 'page', page] as const,
};
