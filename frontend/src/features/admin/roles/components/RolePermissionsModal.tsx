import { useEffect, useMemo, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { Button, ModalBase, Loading } from '@shared/components';
import {
	TPermission,
	TRole,
	useGetRole,
	useGetPermissionsCatalog,
	useUpdateRolePermissions,
} from '@api/roles';
import { Actions, AssignableActions, Subjects } from '@config/lib/casl/ability';
import {
	ACTION_LABELS,
	IMPLIED_ACTION_LABELS,
	SUBJECT_LABELS,
} from './permission-labels';

const formatImplied = (permission: string) => {
	const [action, subject] = permission.split(':') as [Actions, Subjects];

	return `${IMPLIED_ACTION_LABELS[action] ?? action} ${
		SUBJECT_LABELS[subject] ?? subject
	}`;
};

interface RolePermissionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	role?: TRole;
}

const ACTIONS_ORDER: AssignableActions[] = [
	'manage',
	'read',
	'create',
	'update',
	'delete',
];

// Orden de importancia: los módulos de alto impacto (dashboards, académico,
// organización) van arriba; los catálogos y vistas de bajo impacto al final.
const SUBJECTS_ORDER: Subjects[] = [
	'dashboard-authorities',
	'dashboard-coordinator',
	'dashboard-teacher',
	'dashboard-monitor',
	'courses',
	'planifications',
	'reports',
	'periods',
	'degrees',
	'activities',
	'users',
	'user-departments',
	'user-status',
	'faculties',
	'departments',
	'positions',
	'centers',
	'schedule-compliance-check',
	'reports-monitor',
	'buildings',
	'classrooms',
	'pc-equipments',
	'audio-equipments',
	'air-conditioners',
	'digital-blackboards',
	'teacher-categories',
	'contract-types',
	'shifts',
	'brands',
	'conditions',
	'connectivities',
	'room-types',
	'pc-types',
	'monitor-types',
	'monitor-sizes',
];

const SUBJECT_INDEX = new Map(
	SUBJECTS_ORDER.map((subject, index) => [subject, index])
);

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
		const map = new Map<Subjects, TPermission[]>();
		for (const permission of catalog?.permissions ?? []) {
			const list = map.get(permission.subject) ?? [];
			list.push(permission);
			map.set(permission.subject, list);
		}
		return map;
	}, [catalog]);

	const orderedSubjects = useMemo(
		() =>
			Array.from(bySubject.keys()).sort(
				(a, b) =>
					(SUBJECT_INDEX.get(a) ?? SUBJECTS_ORDER.length) -
					(SUBJECT_INDEX.get(b) ?? SUBJECTS_ORDER.length)
			),
		[bySubject]
	);

	const impliedPermissions = catalog?.impliedPermissions ?? {};

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
					incluye ver, crear, editar y eliminar. Lo que aparece como
					<span className="text-green-700"> Incluye </span>
					se concede solo: &quot;Consultar&quot; es apenas la lista para
					llenar un desplegable, mientras que los dashboards conceden lo
					que dejan hacer sus pestañas &mdash; son permisos amplios.
				</p>

				{isLoading ? (
					<Loading />
				) : (
					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="overflow-auto max-h-[60vh] rounded-lg border border-gray-100">
							<table className="w-full text-sm">
								<thead className="bg-gray-50">
									<tr>
										<th className="sticky top-0 left-0 z-30 bg-gray-50 text-left px-3 py-2 font-semibold text-gray-700 border-b border-gray-200">
											Módulo
										</th>
										{ACTIONS_ORDER.map(action => (
											<th
												key={action}
												className="sticky top-0 z-20 bg-gray-50 px-3 py-2 font-semibold text-gray-700 text-center whitespace-nowrap border-b border-gray-200"
											>
												{ACTION_LABELS[action]}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{orderedSubjects.map(subject => {
										const permissions = bySubject.get(subject);
										return (
											<tr
												key={subject}
												className="border-t border-gray-100"
											>
												<td className="sticky left-0 z-10 bg-white px-3 py-2 text-gray-700 border-r border-gray-100">
													<span>
														{SUBJECT_LABELS[subject] ??
															subject}
													</span>
													{!!impliedPermissions[
														subject
													]?.length && (
														<span className="block text-[11px] text-green-700">
															Incluye:{' '}
															{impliedPermissions[
																subject
															]!.map(
																formatImplied
															).join(', ')}
														</span>
													)}
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
										);
									})}
								</tbody>
							</table>
						</div>

						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
							<p className="text-sm text-gray-500">
								{selected.size} de{' '}
								{catalog?.permissions.length ?? 0} permisos
								marcados
							</p>
							<div className="flex justify-end gap-3">
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
						</div>
					</form>
				)}
			</div>
		</ModalBase>
	);
};
