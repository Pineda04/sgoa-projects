import { useCallback, useMemo, useState } from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataTable, IDataTableColumn, ModalBase, useModal } from '@shared';
import {
	TDigitalBlackboard,
	useDeleteDigitalBlackboard,
} from '@api/digital-blackboards';
import { useGetAllBrands } from '@api/brands';
import { useGetAllConditions } from '@api/conditions';
import { useGetAllMonitorSizes, useGetAllMonitorTypes } from '@api/pc-equipments';
import { DeleteDigitalBlackboardModal } from './DeleteDigitalBlackboardModal';
import { EditDigitalBlackboardForm } from './EditDigitalBlackboardForm';

interface DigitalBlackboardsTableProps {
	data: TDigitalBlackboard[];
	isLoading: boolean;
	canUpdate: boolean;
	canDelete: boolean;
}

export const DigitalBlackboardsTable = ({
	data,
	isLoading,
	canUpdate,
	canDelete,
}: DigitalBlackboardsTableProps) => {
	const [isDeleteOpen, openDelete, closeDelete] = useModal();
	const [selectedDigitalBlackboard, setSelectedDigitalBlackboard] = useState<
		TDigitalBlackboard | undefined
	>();

	const [isEditOpen, openEdit, closeEdit] = useModal();
	const [editingDigitalBlackboardId, setEditingDigitalBlackboardId] =
		useState<string | null>(null);

	const { deleteDigitalBlackboard, isPendingDelete } =
		useDeleteDigitalBlackboard();

	const brands = useGetAllBrands();
	const conditions = useGetAllConditions();
	const monitorTypes = useGetAllMonitorTypes();
	const monitorSizes = useGetAllMonitorSizes();

	const brandMap = useMemo(
		() => new Map(brands.data?.map(b => [b.id, b.name])),
		[brands.data]
	);
	const conditionMap = useMemo(
		() => new Map(conditions.data?.map(c => [c.id, c.status])),
		[conditions.data]
	);
	const monitorTypeMap = useMemo(
		() => new Map(monitorTypes.data?.map(t => [t.id, t.description])),
		[monitorTypes.data]
	);
	const monitorSizeMap = useMemo(
		() => new Map(monitorSizes.data?.map(s => [s.id, s.description])),
		[monitorSizes.data]
	);

	const handleOpenDelete = useCallback(
		(digitalBlackboard: TDigitalBlackboard) => {
			setSelectedDigitalBlackboard(digitalBlackboard);
			openDelete();
		},
		[openDelete]
	);

	const handleCloseDelete = () => {
		closeDelete();
		setSelectedDigitalBlackboard(undefined);
	};

	const handleConfirmDelete = async () => {
		if (!selectedDigitalBlackboard) return;
		try {
			await deleteDigitalBlackboard(selectedDigitalBlackboard.id);
			handleCloseDelete();
		} catch {
			// El error ya se muestra mediante el manejador global de mutaciones.
			// El modal de confirmación se mantiene abierto para reintentar.
		}
	};

	const handleOpenEdit = useCallback(
		(digitalBlackboard: TDigitalBlackboard) => {
			setEditingDigitalBlackboardId(digitalBlackboard.id);
			openEdit();
		},
		[openEdit]
	);

	const handleCloseEdit = () => {
		closeEdit();
		setEditingDigitalBlackboardId(null);
	};

	const columns: IDataTableColumn<TDigitalBlackboard>[] = [
		{
			key: 'description',
			header: 'Descripción',
			mobileLabel: 'Descripción',
			render: row => row.description ?? '—',
		},
		{
			key: 'brandId',
			header: 'Marca',
			mobileLabel: 'Marca',
			render: row => brandMap.get(row.brandId) ?? '—',
		},
		{
			key: 'monitorTypeId',
			header: 'Tipo de Monitor',
			mobileLabel: 'Tipo de Monitor',
			render: row => monitorTypeMap.get(row.monitorTypeId) ?? '—',
		},
		{
			key: 'monitorSizeId',
			header: 'Tamaño',
			mobileLabel: 'Tamaño',
			render: row => monitorSizeMap.get(row.monitorSizeId) ?? '—',
		},
		{
			key: 'conditionId',
			header: 'Condición',
			mobileLabel: 'Condición',
			render: row => conditionMap.get(row.conditionId) ?? '—',
		},
		{
			key: 'actions',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			render: (row: TDigitalBlackboard) => (
				<div className="flex items-center justify-center gap-3">
					{canUpdate && (
						<button
							onClick={() => handleOpenEdit(row)}
							className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
							title="Editar pizarra digital"
						>
							<PencilSquareIcon className="size-5" />
						</button>
					)}
					{canDelete && (
						<button
							onClick={() => handleOpenDelete(row)}
							className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
							title="Eliminar pizarra digital"
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
			<DataTable<TDigitalBlackboard>
				columns={columns}
				data={data}
				getRowKey={row => row.id}
				loading={isLoading}
				emptyMessage="No hay pizarras digitales registradas"
				showRowNumber={false}
			/>

			<DeleteDigitalBlackboardModal
				isOpen={isDeleteOpen}
				onClose={handleCloseDelete}
				onConfirm={handleConfirmDelete}
				description={selectedDigitalBlackboard?.description}
				isPending={isPendingDelete}
			/>

			<ModalBase isOpen={isEditOpen} onClose={handleCloseEdit}>
				{editingDigitalBlackboardId && (
					<EditDigitalBlackboardForm
						digitalBlackboardId={editingDigitalBlackboardId}
						onCancel={handleCloseEdit}
						onSuccess={handleCloseEdit}
					/>
				)}
			</ModalBase>
		</>
	);
};
