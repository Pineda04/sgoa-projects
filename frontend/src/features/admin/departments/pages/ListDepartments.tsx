import { useState } from 'react';
import { useGetDepartments, useDeleteDepartmentMutation } from '@api/departments';
import { TOutputDepartment } from '@api/departments';
import { useAbility } from '@config';
import { Button, useModal } from '@shared';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Navigate } from 'react-router-dom';
import {
	CreateDepartmentModal,
	EditDepartmentModal,
	DeleteDepartmentModal,
	DepartmentTable,
} from '../components';

export const ListDepartments = () => {
	const ability = useAbility();
	const canRead = ability.can('read', 'departments');
	const canCreate = ability.can('create', 'departments');
	const canUpdate = ability.can('update', 'departments');
	const canDelete = ability.can('delete', 'departments');

	const { isLoading, isError, data } = useGetDepartments();
	const [selectedDepartment, setSelectedDepartment] =
		useState<TOutputDepartment | null>(null);
	const [isCreateOpen, openCreate, closeCreate] = useModal();
	const [isEditOpen, openEdit, closeEdit] = useModal();
	const [isDeleteOpen, openDelete, closeDelete] = useModal();
	const { deleteDepartment, isPendingDelete } = useDeleteDepartmentMutation(
		selectedDepartment?.id ?? ''
	);

	if (!canRead && !canCreate && !canUpdate && !canDelete) {
		return <Navigate to="/home" replace />;
	}

	const handleOpenEdit = (department: TOutputDepartment) => {
		setSelectedDepartment(department);
		openEdit();
	};

	const handleOpenDelete = (department: TOutputDepartment) => {
		setSelectedDepartment(department);
		openDelete();
	};

	const handleCloseEdit = () => {
		closeEdit();
		setSelectedDepartment(null);
	};

	const handleConfirmDelete = () => {
		if (!selectedDepartment) return;
		deleteDepartment(selectedDepartment.id).then(() => {
			closeDelete();
			setSelectedDepartment(null);
		});
	};

	return (
		<div className="pb-8 sm:pb-12">
			<div className="flex justify-between items-end mb-5">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Gestión de Departamentos
					</h1>
					<p className="text-muted-foreground mt-1">
						Administre los departamentos académicos del sistema.
					</p>
				</div>
				{canCreate && (
					<Button
						onClick={openCreate}
						className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
					>
						<PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
						<span>Nuevo Departamento</span>
					</Button>
				)}
			</div>
			{isError ? (
				<p className="text-sm text-red-500">
					Error al cargar los departamentos. Intenta nuevamente.
				</p>
			) : !data && !isLoading ? (
				<p>No hay departamentos agregados...</p>
			) : (
				data && (
					<DepartmentTable
						data={data}
						isLoading={isLoading}
						canUpdate={canUpdate}
						canDelete={canDelete}
						onEdit={handleOpenEdit}
						onDelete={handleOpenDelete}
					/>
				)
			)}

			<CreateDepartmentModal
				isOpen={isCreateOpen}
				onClose={closeCreate}
			/>

			<EditDepartmentModal
				isOpen={isEditOpen}
				onClose={handleCloseEdit}
				department={selectedDepartment}
			/>

			<DeleteDepartmentModal
				isOpen={isDeleteOpen}
				onClose={() => {
					closeDelete();
					setSelectedDepartment(null);
				}}
				onConfirm={handleConfirmDelete}
				departmentName={selectedDepartment?.name}
				isPending={isPendingDelete}
			/>
		</div>
	);
};
