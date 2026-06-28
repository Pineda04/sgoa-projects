export const facultiesKeys = {
    all: ['faculties'] as const,
    detail: (id: string) => [...facultiesKeys.all, 'detail', id] as const,
    page: (page: number) => [...facultiesKeys.all, 'page', page] as const,
};
