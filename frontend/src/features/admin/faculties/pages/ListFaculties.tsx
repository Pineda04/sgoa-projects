import { useState } from 'react';
import { useGetAllFaculties, useDeleteFacultyMutation } from '@api/faculties';
import { TFaculty } from '@api/faculties';
import { useAbility } from '@config';
import { Button, useModal } from '@shared';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Navigate } from 'react-router-dom';
import {
	CreateFacultyModal,
	EditFacultyModal,
	DeleteFacultyModal,
	FacultyTable,
} from '../components';

export const ListFaculties = () => {
	const ability = useAbility();
	const canRead = ability.can('read', 'faculties');
	const canCreate = ability.can('create', 'faculties');
	const canUpdate = ability.can('update', 'faculties');
	const canDelete = ability.can('delete', 'faculties');

	const { isLoading, isError, data } = useGetAllFaculties();
	const [selectedFaculty, setSelectedFaculty] = useState<TFaculty | null>(
		null
	);
	const [isCreateOpen, openCreate, closeCreate] = useModal();
	const [isEditOpen, openEdit, closeEdit] = useModal();
	const [isDeleteOpen, openDelete, closeDelete] = useModal();
	const { deleteFaculty, isPendingDelete } = useDeleteFacultyMutation(
		selectedFaculty?.id ?? ''
	);

	if (!canRead && !canCreate && !canUpdate && !canDelete) {
		return <Navigate to="/home" replace />;
	}

	const handleOpenEdit = (faculty: TFaculty) => {
		setSelectedFaculty(faculty);
		openEdit();
	};

	const handleOpenDelete = (faculty: TFaculty) => {
		setSelectedFaculty(faculty);
		openDelete();
	};

	const handleCloseEdit = () => {
		closeEdit();
		setSelectedFaculty(null);
	};

	const handleConfirmDelete = () => {
		if (!selectedFaculty) return;
		deleteFaculty(selectedFaculty.id).then(() => {
			closeDelete();
			setSelectedFaculty(null);
		});
	};

	return (
		<div className="pb-8 sm:pb-12">
			<div className="flex justify-between items-end mb-5">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Gestión de Facultades
					</h1>
					<p className="text-muted-foreground mt-1">
						Administre las facultades académicas del sistema.
					</p>
				</div>
				{canCreate && (
					<Button
						onClick={openCreate}
						className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
					>
						<PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
						<span>Nueva Facultad</span>
					</Button>
				)}
			</div>
			{isError ? (
				<p className="text-sm text-red-500">
					Error al cargar las facultades. Intenta nuevamente.
				</p>
			) : !data && !isLoading ? (
				<p>No hay facultades agregadas...</p>
			) : (
				data && (
					<FacultyTable
						data={data}
						isLoading={isLoading}
						canUpdate={canUpdate}
						canDelete={canDelete}
						onEdit={handleOpenEdit}
						onDelete={handleOpenDelete}
					/>
				)
			)}

			<CreateFacultyModal isOpen={isCreateOpen} onClose={closeCreate} />

			<EditFacultyModal
				isOpen={isEditOpen}
				onClose={handleCloseEdit}
				faculty={selectedFaculty}
			/>

			<DeleteFacultyModal
				isOpen={isDeleteOpen}
				onClose={() => {
					closeDelete();
					setSelectedFaculty(null);
				}}
				onConfirm={handleConfirmDelete}
				facultyName={selectedFaculty?.name}
				isPending={isPendingDelete}
			/>
		</div>
	);
};
