import { useCallback, useState } from 'react';
import {
	PencilSquareIcon,
	TrashIcon,
	PlusIcon,
	KeyIcon,
} from '@heroicons/react/24/outline';
import { Button, DataTable, IDataTableColumn, useModal } from '@shared';
import { TRole, useDeleteRole } from '@api/roles';
import { RoleFormModal } from './RoleFormModal';
import { RoleDeleteModal } from './RoleDeleteModal';
import { RolePermissionsModal } from './RolePermissionsModal';

interface RoleTableProps {
	data: TRole[];
	isLoading: boolean;
}

export const RoleTable = ({ data, isLoading }: RoleTableProps) => {
	const [isFormOpen, openForm, closeForm] = useModal();
	const [isDeleteOpen, openDelete, closeDelete] = useModal();
	const [isPermissionsOpen, openPermissions, closePermissions] = useModal();
	const [selectedRole, setSelectedRole] = useState<TRole | undefined>();

	const { deleteRole, isPendingDelete } = useDeleteRole(
		selectedRole?.id ?? ''
	);

	const handleOpenCreate = () => {
		setSelectedRole(undefined);
		openForm();
	};

	const handleOpenEdit = useCallback(
		(role: TRole) => {
			setSelectedRole(role);
			openForm();
		},
		[openForm]
	);

	const handleOpenPermissions = useCallback(
		(role: TRole) => {
			setSelectedRole(role);
			openPermissions();
		},
		[openPermissions]
	);

	const handleOpenDelete = useCallback(
		(role: TRole) => {
			setSelectedRole(role);
			openDelete();
		},
		[openDelete]
	);

	const handleCloseForm = () => {
		closeForm();
		setSelectedRole(undefined);
	};

	const handleClosePermissions = () => {
		closePermissions();
		setSelectedRole(undefined);
	};

	const handleCloseDelete = () => {
		closeDelete();
		setSelectedRole(undefined);
	};

	const handleConfirmDelete = async () => {
		if (!selectedRole) return;
		await deleteRole();
		handleCloseDelete();
	};

	const columns: IDataTableColumn<TRole>[] = [
		{
			key: 'name',
			header: 'Nombre',
			mobileLabel: 'Nombre',
			render: role => (
				<div className="flex items-center gap-2">
					<span className="font-medium">{role.name}</span>
					{role.isSuperAdmin && (
						<span className="text-[10px] uppercase tracking-wide bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
							Protegido
						</span>
					)}
				</div>
			),
		},
		{
			key: 'description',
			header: 'Descripción',
			mobileLabel: 'Descripción',
			render: role => role.description || '—',
		},
		{
			key: 'actions',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			render: role =>
				role.isSuperAdmin ? (
					<span className="text-xs text-gray-400">No editable</span>
				) : (
					<div className="flex items-center justify-center gap-3">
						<button
							onClick={() => handleOpenPermissions(role)}
							className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors cursor-pointer"
							title="Editar permisos"
						>
							<KeyIcon className="size-5" />
						</button>
						<button
							onClick={() => handleOpenEdit(role)}
							className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
							title="Editar rol"
						>
							<PencilSquareIcon className="size-5" />
						</button>
						<button
							onClick={() => handleOpenDelete(role)}
							className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
							title="Eliminar rol"
						>
							<TrashIcon className="size-5" />
						</button>
					</div>
				),
		},
	];

	return (
		<>
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
				<div className="min-w-0">
					<h1 className="text-2xl font-bold text-foreground">
						Roles y Permisos
					</h1>
					<p className="text-muted-foreground mt-1 text-sm sm:text-base">
						Crea roles y define qué puede hacer cada uno. Luego
						asígnalos a los usuarios desde la gestión de usuarios.
					</p>
				</div>
				<div className="shrink-0 sm:flex sm:items-end">
					<Button
						type="button"
						className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium shadow-xs transition-all duration-300 hover:shadow-md active:scale-95 group"
						onClick={handleOpenCreate}
					>
						<PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
						<span>Nuevo Rol</span>
					</Button>
				</div>
			</div>

			<DataTable<TRole>
				columns={columns}
				data={data}
				getRowKey={row => row.id}
				loading={isLoading}
				emptyMessage="No hay roles registrados"
				showRowNumber={false}
			/>

			<RoleFormModal
				isOpen={isFormOpen}
				onClose={handleCloseForm}
				role={selectedRole}
			/>

			<RolePermissionsModal
				isOpen={isPermissionsOpen}
				onClose={handleClosePermissions}
				role={selectedRole}
			/>

			<RoleDeleteModal
				isOpen={isDeleteOpen}
				onClose={handleCloseDelete}
				onConfirm={handleConfirmDelete}
				roleName={selectedRole?.name}
				isPending={isPendingDelete}
			/>
		</>
	);
};
