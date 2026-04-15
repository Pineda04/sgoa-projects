export const centerKeys = {
	all: ['centers'] as const,
	detail: (id: string) => [...centerKeys.all, 'detail', id] as const,
};
