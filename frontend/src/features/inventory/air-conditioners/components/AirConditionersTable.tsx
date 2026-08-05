import { useCallback, useState } from 'react';
import {
	EyeIcon,
	PencilSquareIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import { DataTable, IDataTableColumn, ModalBase, useModal } from '@shared';
import {
	TAirConditioner,
	useDeleteAirConditioner,
} from '@api/air-conditioners';
import { DeleteAirConditionerModal } from './DeleteAirConditionerModal';
import { EditAirConditionerForm } from './EditAirConditionerForm';
import { ViewAirConditionerModal } from './ViewAirConditionerModal';

interface AirConditionersTableProps {
	data: TAirConditioner[];
	isLoading: boolean;
	canUpdate: boolean;
	canDelete: boolean;
}

export const AirConditionersTable = ({
	data,
	isLoading,
	canUpdate,
	canDelete,
}: AirConditionersTableProps) => {
	const [isDeleteOpen, openDelete, closeDelete] = useModal();
	const [selectedAirConditioner, setSelectedAirConditioner] = useState<
		TAirConditioner | undefined
	>();

	const [isEditOpen, openEdit, closeEdit] = useModal();
	const [editingAirConditionerId, setEditingAirConditionerId] = useState<
		string | null
	>(null);

	const [isViewOpen, openView, closeView] = useModal();
	const [viewingAirConditionerId, setViewingAirConditionerId] = useState<
		string | null
	>(null);

	const { deleteAirConditioner, isPendingDelete } = useDeleteAirConditioner();

	const handleOpenDelete = useCallback(
		(airConditioner: TAirConditioner) => {
			setSelectedAirConditioner(airConditioner);
			openDelete();
		},
		[openDelete],
	);

	const handleCloseDelete = () => {
		closeDelete();
		setSelectedAirConditioner(undefined);
	};

	const handleConfirmDelete = async () => {
		if (!selectedAirConditioner) return;
		await deleteAirConditioner(selectedAirConditioner.id);
		handleCloseDelete();
	};

	const handleOpenEdit = useCallback(
		(airConditioner: TAirConditioner) => {
			setEditingAirConditionerId(airConditioner.id);
			openEdit();
		},
		[openEdit],
	);

	const handleCloseEdit = () => {
		closeEdit();
		setEditingAirConditionerId(null);
	};

	const handleOpenView = useCallback(
		(airConditioner: TAirConditioner) => {
			setViewingAirConditionerId(airConditioner.id);
			openView();
		},
		[openView],
	);

	const handleCloseView = () => {
		closeView();
		setViewingAirConditionerId(null);
	};

	const columns: IDataTableColumn<TAirConditioner>[] = [
		{
			key: 'description',
			header: 'Descripción',
			mobileLabel: 'Descripción',
			render: row => (
				<span
					className="max-w-50 truncate text-center w-full inline-block"
					title={row.description ?? undefined}
				>
					{row.description ?? '—'}
				</span>
			),
		},
		{
			key: 'brand',
			header: 'Marca',
			mobileLabel: 'Marca',
			render: row => row.brand?.name ?? '—',
		},
		{
			key: 'condition',
			header: 'Condición',
			mobileLabel: 'Condición',
			render: row => row.condition?.status ?? '—',
		},
		{
			key: 'classroom',
			header: 'Aula',
			mobileLabel: 'Aula',
			render: row => row.classroom?.name ?? 'Sin aula asignada',
		},
		{
			key: 'actions',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			render: (row: TAirConditioner) => (
				<div className="flex items-center justify-center gap-3">
					<button
						onClick={() => handleOpenView(row)}
						className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
						title="Ver aire acondicionado"
					>
						<EyeIcon className="size-5" />
					</button>
					{canUpdate && (
						<button
							onClick={() => handleOpenEdit(row)}
							className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
							title="Editar aire acondicionado"
						>
							<PencilSquareIcon className="size-5" />
						</button>
					)}
					{canDelete && (
						<button
							onClick={() => handleOpenDelete(row)}
							className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
							title="Eliminar aire acondicionado"
						>
							<TrashIcon className="size-5" />
						</button>
					)}
				</div>
			),
		},
	];

	return (
		<>
			<DataTable<TAirConditioner>
				columns={columns}
				data={data}
				getRowKey={row => row.id}
				loading={isLoading}
				emptyMessage="No hay aires acondicionados registrados"
				showRowNumber={false}
			/>

			<DeleteAirConditionerModal
				isOpen={isDeleteOpen}
				onClose={handleCloseDelete}
				onConfirm={handleConfirmDelete}
				classroomName={selectedAirConditioner?.classroom?.name}
				buildName={selectedAirConditioner?.classroom?.build?.name}
				centerName={selectedAirConditioner?.classroom?.build?.center?.name}
				isPending={isPendingDelete}
			/>

			<ModalBase isOpen={isEditOpen} onClose={handleCloseEdit}>
				{editingAirConditionerId && (
					<EditAirConditionerForm
						airConditionerId={editingAirConditionerId}
						onCancel={handleCloseEdit}
						onSuccess={handleCloseEdit}
					/>
				)}
			</ModalBase>

			{viewingAirConditionerId && (
				<ViewAirConditionerModal
					isOpen={isViewOpen}
					onClose={handleCloseView}
					airConditionerId={viewingAirConditionerId}
				/>
			)}
		</>
	);
};
