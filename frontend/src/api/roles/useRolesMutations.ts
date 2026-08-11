import { useMutation } from '@tanstack/react-query';
import { alertSuccess } from '@shared';
import { queryClient } from '@config';
import { rolesApi } from './roles.api';
import { rolesKeys } from './roles.keys';
import {
	TCreateRole,
	TUpdateRole,
	TUpdateRolePermissions,
} from './roles.types';

export const useCreateRole = () =>
	useMutation({
		mutationFn: (body: TCreateRole) => rolesApi.create(body),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({ queryKey: rolesKeys.all });
		},
	});

export const useUpdateRole = (roleId: string) => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (body: TUpdateRole) =>
			rolesApi.update({ id: roleId, body }),
		onSuccess: async res => {
			alertSuccess(res);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: rolesKeys.all }),
				queryClient.invalidateQueries({
					queryKey: rolesKeys.detail(roleId),
				}),
			]);
		},
	});

	return { updateRole: mutateAsync, isPendingUpdate: isPending };
};

export const useUpdateRolePermissions = (roleId: string) => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: (body: TUpdateRolePermissions) =>
			rolesApi.updatePermissions({ id: roleId, body }),
		onSuccess: async res => {
			alertSuccess(res);
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: rolesKeys.all }),
				queryClient.invalidateQueries({
					queryKey: rolesKeys.detail(roleId),
				}),
			]);
		},
	});

	return {
		updateRolePermissions: mutateAsync,
		isPendingUpdatePermissions: isPending,
	};
};

export const useDeleteRole = (roleId: string) => {
	const { mutateAsync, isPending } = useMutation({
		mutationFn: () => rolesApi.remove(roleId),
		onSuccess: async res => {
			alertSuccess(res);
			await queryClient.invalidateQueries({ queryKey: rolesKeys.all });
		},
	});

	return { deleteRole: mutateAsync, isPendingDelete: isPending };
};
