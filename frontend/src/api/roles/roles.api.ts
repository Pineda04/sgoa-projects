import { api } from '@config/lib';
import { IResponse } from '@shared';
import {
	TCreateRole,
	TPermissionsCatalog,
	TRole,
	TRoleWithPermissions,
	TUpdateRole,
	TUpdateRolePermissions,
} from './roles.types';

export const rolesApi = {
	getAll: () => api.get<IResponse<TRole[]>>(`/roles`),

	getOne: (id: string) =>
		api.get<IResponse<TRoleWithPermissions>>(`/roles/${id}`),

	getPermissionsCatalog: () =>
		api.get<IResponse<TPermissionsCatalog>>(`/roles/permissions/catalog`),

	create: (body: TCreateRole) => api.post<IResponse<TRole>>(`/roles`, body),

	update: ({ id, body }: { id: string; body: TUpdateRole }) =>
		api.patch<IResponse<TRole>>(`/roles/${id}`, body),

	updatePermissions: ({
		id,
		body,
	}: {
		id: string;
		body: TUpdateRolePermissions;
	}) => api.patch<IResponse<TRole>>(`/roles/${id}/permissions`, body),

	remove: (id: string) => api.delete<IResponse<TRole>>(`/roles/${id}`),
};
