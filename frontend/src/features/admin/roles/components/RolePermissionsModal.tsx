import { useEffect, useMemo, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { Button, ModalBase, Loading } from '@shared/components';
import {
	TRole,
	useGetRole,
	useGetPermissionsCatalog,
	useUpdateRolePermissions,
} from '@api/roles';
import { Actions } from '@config/lib/casl/ability';
import { ACTION_LABELS, SUBJECT_LABELS } from './permission-labels';

interface RolePermissionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	role?: TRole;
}

const ACTIONS_ORDER: Actions[] = ['manage', 'read', 'create', 'update', 'delete'];

export const RolePermissionsModal = ({
	isOpen,
	onClose,
	role,
}: RolePermissionsModalProps) => {
	const { data: roleData, isLoading: isLoadingRole } = useGetRole(role?.id ?? '');
	const { data: catalog, isLoading: isLoadingCatalog } = useGetPermissionsCatalog();
	const { updateRolePermissions, isPendingUpdatePermissions } =
		useUpdateRolePermissions(role?.id ?? '');

	const [selected, setSelected] = useState<Set<string>>(new Set());

	useEffect(() => {
		if (isOpen && roleData) {
			setSelected(new Set(roleData.permissions.map(p => p.id)));
		}
	}, [isOpen, roleData]);

	const bySubject = useMemo(() => {
		const map = new Map<string, typeof catalog>();
		for (const permission of catalog ?? []) {
			const list = map.get(permission.subject) ?? [];
			list.push(permission);
			map.set(permission.subject, list);
		}
		return map;
	}, [catalog]);

	const togglePermission = (permissionId: string) => {
		setSelected(prev => {
			const next = new Set(prev);
			if (next.has(permissionId)) next.delete(permissionId);
			else next.add(permissionId);
			return next;
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await updateRolePermissions({ permissionIds: Array.from(selected) });
		onClose();
	};

	const isLoading = isLoadingRole || isLoadingCatalog;

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold text-slate-800 mb-1">
					Permisos de {role?.name}
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					Marca las acciones permitidas por módulo. &quot;Gestionar&quot;
					incluye ver, crear, editar y eliminar.
				</p>

				{isLoading ? (
					<Loading />
				) : (
					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="overflow-x-auto border border-gray-100 rounded-lg">
							<table className="w-full text-sm">
								<thead className="bg-gray-50">
									<tr>
										<th className="text-left px-3 py-2 font-semibold text-gray-700">
											Módulo
										</th>
										{ACTIONS_ORDER.map(action => (
											<th
												key={action}
												className="px-3 py-2 font-semibold text-gray-700 text-center whitespace-nowrap"
											>
												{ACTION_LABELS[action]}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{Array.from(bySubject.entries()).map(
										([subject, permissions]) => (
											<tr
												key={subject}
												className="border-t border-gray-100"
											>
												<td className="px-3 py-2 text-gray-700">
													{SUBJECT_LABELS[
														subject as keyof typeof SUBJECT_LABELS
													] ?? subject}
												</td>
												{ACTIONS_ORDER.map(action => {
													const permission = permissions?.find(
														p => p.action === action
													);
													if (!permission)
														return (
															<td
																key={action}
																className="px-3 py-2 text-center"
															/>
														);
													return (
														<td
															key={action}
															className="px-3 py-2 text-center"
														>
															<input
																type="checkbox"
																checked={selected.has(
																	permission.id
																)}
																onChange={() =>
																	togglePermission(
																		permission.id
																	)
																}
																disabled={
																	isPendingUpdatePermissions
																}
																className="size-4 cursor-pointer accent-green-600"
															/>
														</td>
													);
												})}
											</tr>
										)
									)}
								</tbody>
							</table>
						</div>

						<div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								disabled={isPendingUpdatePermissions}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
								disabled={isPendingUpdatePermissions}
							>
								{!isPendingUpdatePermissions && (
									<FiSave className="size-4" />
								)}
								<span>
									{isPendingUpdatePermissions
										? 'Guardando...'
										: 'Guardar Permisos'}
								</span>
							</Button>
						</div>
					</form>
				)}
			</div>
		</ModalBase>
	);
};
