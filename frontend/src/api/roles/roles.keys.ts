export const rolesKeys = {
	all: ['roles'] as const,
	detail: (id: string) => [...rolesKeys.all, 'detail', id] as const,
	permissionsCatalog: ['roles', 'permissions', 'catalog'] as const,
};
