import { useCreatePosition, useDeletePositionMutation, useGetAllPositions, useUpdatePosition } from '@api/positions';
import { TOutputPosition } from '@api/positions';
import { useAbility } from '@config';
import { Button, useModal } from '@shared';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PositionDeleteModal, PositionFormModal, PositionTable } from '../components';
import { TCreatePosition } from '../schemas';

export const ListPositions = () => {
	const ability = useAbility();
	const canCreate = ability.can('create', 'positions');
	const canUpdate = ability.can('update', 'positions');
	const canDelete = ability.can('delete', 'positions');

	const { data, isLoading, isError } = useGetAllPositions();
	const [selectedPosition, setSelectedPosition] = useState<TOutputPosition | undefined>();
	const [isFormOpen, openForm, closeForm] = useModal();
	const [isDeleteOpen, openDelete, closeDelete] = useModal();
	const { mutateAsync: createPosition, isPending: isPendingCreate } = useCreatePosition();
	const { updatePosition, isPendingUpdate } = useUpdatePosition(selectedPosition?.id ?? '');
	const { deletePosition, isPendingDelete } = useDeletePositionMutation(selectedPosition?.id ?? '');

	const handleOpenEdit = (position: TOutputPosition) => {
		setSelectedPosition(position);
		openForm();
	};

	const handleOpenDelete = (position: TOutputPosition) => {
		setSelectedPosition(position);
		openDelete();
	};

	const handleCloseForm = () => {
		closeForm();
		setSelectedPosition(undefined);
	};

	const handleCloseDelete = () => {
		closeDelete();
		setSelectedPosition(undefined);
	};

	const handleConfirmDelete = async () => {
		if (!selectedPosition) return;
		await deletePosition(selectedPosition.id);
		handleCloseDelete();
	};

	const handleSubmitForm = async (values: TCreatePosition) => {
		if (selectedPosition) {
			await updatePosition(values);
		} else {
			await createPosition(values);
		}
		handleCloseForm();
	};

	if (!canCreate && !canUpdate && !canDelete) {
		return <Navigate to="/home" replace />;
	}

	return (
		<div className="pb-8 sm:pb-12">
			<div className="flex justify-between items-end mb-5">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Gestión de Cargos Académicos
					</h1>
					<p className="text-muted-foreground mt-1">
						Administre los cargos del sistema.
					</p>
				</div>
				{canCreate && (
					<Button
						type="button"
						className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
						onClick={() => {
							setSelectedPosition(undefined);
							openForm();
						}}
					>
						<PlusIcon className="size-6" />
						Nueva posición
					</Button>
				)}
			</div>

			{isError ? (
				<p className="text-sm text-red-500">Error al cargar las posiciones. Intenta nuevamente.</p>
			) : !data && !isLoading ? (
				<p>No hay posiciones agregadas...</p>
			) : (
				data && (
					<PositionTable
						data={data}
						isLoading={isLoading}
						canUpdate={canUpdate}
						canDelete={canDelete}
						onEdit={handleOpenEdit}
						onDelete={handleOpenDelete}
					/>
				)
			)}

			<PositionFormModal
				isOpen={isFormOpen}
				onClose={handleCloseForm}
				position={selectedPosition}
				onSubmit={handleSubmitForm}
				isPending={selectedPosition ? isPendingUpdate : isPendingCreate}
			/>

			<PositionDeleteModal
				isOpen={isDeleteOpen}
				onClose={handleCloseDelete}
				position={selectedPosition}
				onConfirm={handleConfirmDelete}
				isPending={isPendingDelete}
			/>
		</div>
	);
};
