export const centersKeys = {
	all: ['centers'] as const,
	detail: (id: string) => [...centersKeys.all, 'detail', id] as const,
};
