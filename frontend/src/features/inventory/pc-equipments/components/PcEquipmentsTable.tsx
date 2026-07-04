import { useCallback, useMemo, useState } from 'react';
import {
	PencilSquareIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import { DataTable, IDataTableColumn, ModalBase, useModal } from '@shared';
import {
	TPcEquipment,
	useDeletePcEquipment,
	useGetAllMonitorSizes,
	useGetAllMonitorTypes,
	useGetAllPcTypes,
} from '@api/pc-equipments';
import { useGetAllBrands } from '@api/brands';
import { useGetAllConditions } from '@api/conditions';
import { DeletePcEquipmentModal } from './DeletePcEquipmentModal';
import { EditPcEquipmentForm } from './EditPcEquipmentForm';

interface PcEquipmentsTableProps {
	data: TPcEquipment[];
	isLoading: boolean;
	canUpdate: boolean;
	canDelete: boolean;
}

export const PcEquipmentsTable = ({
	data,
	isLoading,
	canUpdate,
	canDelete,
}: PcEquipmentsTableProps) => {
	const [isDeleteOpen, openDelete, closeDelete] = useModal();
	const [selectedPcEquipment, setSelectedPcEquipment] = useState<
		TPcEquipment | undefined
	>();

	const [isEditOpen, openEdit, closeEdit] = useModal();
	const [editingPcEquipmentId, setEditingPcEquipmentId] = useState<
		string | null
	>(null);

	const { deletePcEquipment, isPendingDelete } = useDeletePcEquipment();

	const brands = useGetAllBrands();
	const conditions = useGetAllConditions();
	const pcTypes = useGetAllPcTypes();
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
	const pcTypeMap = useMemo(
		() => new Map(pcTypes.data?.map(t => [t.id, t.description])),
		[pcTypes.data]
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
		(pcEquipment: TPcEquipment) => {
			setSelectedPcEquipment(pcEquipment);
			openDelete();
		},
		[openDelete]
	);

	const handleCloseDelete = () => {
		closeDelete();
		setSelectedPcEquipment(undefined);
	};

	const handleConfirmDelete = async () => {
		if (!selectedPcEquipment) return;
		await deletePcEquipment(selectedPcEquipment.id);
		handleCloseDelete();
	};

	const handleOpenEdit = useCallback(
		(pcEquipment: TPcEquipment) => {
			setEditingPcEquipmentId(pcEquipment.id);
			openEdit();
		},
		[openEdit]
	);

	const handleCloseEdit = () => {
		closeEdit();
		setEditingPcEquipmentId(null);
	};

	const hasActions = canUpdate || canDelete;

	const columns: IDataTableColumn<TPcEquipment>[] = [
		{
			key: 'inventoryNumber',
			header: 'N° Inventario',
			mobileLabel: 'Inventario',
		},
		{
			key: 'brandId',
			header: 'Marca',
			mobileLabel: 'Marca',
			render: row => brandMap.get(row.brandId) ?? '—',
		},
		{
			key: 'pcTypeId',
			header: 'Tipo',
			mobileLabel: 'Tipo',
			render: row => pcTypeMap.get(row.pcTypeId) ?? '—',
		},
		{
			key: 'processor',
			header: 'Procesador',
			mobileLabel: 'Procesador',
		},
		{
			key: 'ram',
			header: 'RAM',
			mobileLabel: 'RAM',
		},
		{
			key: 'disk',
			header: 'Disco',
			mobileLabel: 'Disco',
			hiddenOnMobile: true,
		},
		{
			key: 'monitor',
			header: 'Monitor',
			mobileLabel: 'Monitor',
			hiddenOnMobile: true,
			render: row => {
				const type = monitorTypeMap.get(row.monitorTypeId);
				const size = monitorSizeMap.get(row.monitorSizeId);
				if (!type && !size) return '—';
				return [type, size].filter(Boolean).join(' - ');
			},
		},
		{
			key: 'conditionId',
			header: 'Condición',
			mobileLabel: 'Condición',
			render: row => conditionMap.get(row.conditionId) ?? '—',
		},
		...(hasActions
			? ([
					{
						key: 'actions',
						header: 'Acciones',
						mobileLabel: 'Acciones',
						render: (row: TPcEquipment) => (
							<div className="flex items-center justify-center gap-3">
								{canUpdate && (
									<button
										onClick={() => handleOpenEdit(row)}
										className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
										title="Editar equipo"
									>
										<PencilSquareIcon className="size-5" />
									</button>
								)}
								{canDelete && (
									<button
										onClick={() => handleOpenDelete(row)}
										className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
										title="Eliminar equipo"
									>
										<TrashIcon className="size-5" />
									</button>
								)}
							</div>
						),
					},
				] as IDataTableColumn<TPcEquipment>[])
			: []),
	];

	return (
		<>
			<DataTable<TPcEquipment>
				columns={columns}
				data={data}
				getRowKey={row => row.id}
				loading={isLoading}
				emptyMessage="No hay equipos de cómputo registrados"
				showRowNumber={false}
			/>

			<DeletePcEquipmentModal
				isOpen={isDeleteOpen}
				onClose={handleCloseDelete}
				onConfirm={handleConfirmDelete}
				inventoryNumber={selectedPcEquipment?.inventoryNumber}
				isPending={isPendingDelete}
			/>

			<ModalBase isOpen={isEditOpen} onClose={handleCloseEdit}>
				{editingPcEquipmentId && (
					<EditPcEquipmentForm
						pcEquipmentId={editingPcEquipmentId}
						onCancel={handleCloseEdit}
						onSuccess={handleCloseEdit}
					/>
				)}
			</ModalBase>
		</>
	);
};
