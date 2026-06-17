export const facultyKeys = {
    all: ['faculties'] as const,
    detail: (id: string) => [...facultyKeys.all, 'detail', id] as const,
    page: (page: number) => [...facultyKeys.all, 'page', page] as const,
};