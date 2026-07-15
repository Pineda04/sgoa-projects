import { useState } from 'react';
import { useDeletePositionMutation, useGetAllPositions } from '@api/positions';
import { TOutputPosition } from '@api/positions';
import { useAbility } from '@config';
import { Button, useModal } from '@shared';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Navigate } from 'react-router-dom';
import {
	CreatePositionModal,
	EditPositionModal,
	PositionDeleteModal,
	PositionTable,
} from '../components';

export const ListPositions = () => {
	const ability = useAbility();
	const canCreate = ability.can('create', 'positions');
	const canUpdate = ability.can('update', 'positions');
	const canDelete = ability.can('delete', 'positions');

	const { data, isLoading, isError } = useGetAllPositions();
	const [selectedPosition, setSelectedPosition] =
		useState<TOutputPosition | null>(null);
	const [isCreateOpen, openCreate, closeCreate] = useModal();
	const [isEditOpen, openEdit, closeEdit] = useModal();
	const [isDeleteOpen, openDelete, closeDelete] = useModal();
	const { deletePosition, isPendingDelete } = useDeletePositionMutation(
		selectedPosition?.id ?? ''
	);

	const handleOpenEdit = (position: TOutputPosition) => {
		setSelectedPosition(position);
		openEdit();
	};

	const handleOpenDelete = (position: TOutputPosition) => {
		setSelectedPosition(position);
		openDelete();
	};

	const handleCloseEdit = () => {
		closeEdit();
		setSelectedPosition(null);
	};

	const handleConfirmDelete = () => {
		if (!selectedPosition) return;
		deletePosition(selectedPosition.id).then(() => {
			closeDelete();
			setSelectedPosition(null);
		});
	};

	return (
		<div className="pb-8 sm:pb-12">
			<div className="flex justify-between items-end mb-5">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Gestión de Cargos
					</h1>
					<p className="text-muted-foreground mt-1">
						Administre los cargos académicos del sistema.
					</p>
				</div>
				{canCreate && (
					<Button
						onClick={openCreate}
						className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
					>
						<PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
						<span>Nueva Posición</span>
					</Button>
				)}
			</div>

			{isError ? (
				<p className="text-sm text-red-500">
					Error al cargar las posiciones. Intenta nuevamente.
				</p>
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

			<CreatePositionModal isOpen={isCreateOpen} onClose={closeCreate} />

			<EditPositionModal
				isOpen={isEditOpen}
				onClose={handleCloseEdit}
				position={selectedPosition}
			/>

			<PositionDeleteModal
				isOpen={isDeleteOpen}
				onClose={() => {
					closeDelete();
					setSelectedPosition(null);
				}}
				onConfirm={handleConfirmDelete}
				positionName={selectedPosition?.name}
				isPending={isPendingDelete}
			/>
		</div>
	);
};
