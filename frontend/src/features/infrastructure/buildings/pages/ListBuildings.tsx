import { useState } from 'react';
import { useGetAllBuildings } from '@api/buildings/useBuildingsQueries';
import { useDeleteBuildingMutation } from '@api/buildings/useBuildingsMutations';
import { useGetAllCenters } from '@api/centers/useCentersQueries';
import { TBuilding } from '@api/buildings/buildings.types';
import { CreateBuildingModal } from '../components/CreateBuildingModal';
import { EditBuildingModal } from '../components/EditBuildingModal';
import { DeleteBuildingModal } from '../components/DeleteBuildingModal';
import {
	PencilSquareIcon,
	TrashIcon,
	PlusIcon,
} from '@heroicons/react/24/outline';
import {
	Button,
	DataTable,
	ESwalIcons,
	genericAlert,
	IDataTableColumn,
	Loading,
	useModal,
} from '@shared';
import { useAbility } from '@config';

export const ListBuildings = () => {
	// 1. Control de modales y estado del edificio seleccionado para edición o eliminación
	const [isDeleteOpen, openDeleteModal, closeDeleteModal] = useModal();
	const [isCreateOpen, openCreateModal, closeCreateModal] = useModal();
	const [isEditOpen, openEditModal, closeEditOpen] = useModal();
	const [selectedBuilding, setSelectedBuilding] = useState<TBuilding | null>(
		null
	);

	const ability = useAbility();
	const canCreate = ability.can('create', 'buildings');
	const canUpdate = ability.can('update', 'buildings');
	const canDelete = ability.can('delete', 'buildings');

	// 2. Consumo de Queries y Mutaciones de edificios y centros
	const { data: buildingsResponse, isLoading } = useGetAllBuildings();
	const { data: centers } = useGetAllCenters();
	const { mutate: deleteBuilding, isPending: isDeleting } =
		useDeleteBuildingMutation();

	if (isLoading) return <Loading />;

	const handleOpenDelete = (building: TBuilding) => {
		setSelectedBuilding(building);
		openDeleteModal();
	};

	const handleOpenEdit = (building: TBuilding) => {
		setSelectedBuilding(building);
		openEditModal();
	};

	const handleConfirmDelete = () => {
		if (selectedBuilding) {
			deleteBuilding(selectedBuilding.id, {
				onSuccess: () => {
					genericAlert(
						'Se ha eliminado el edificio con éxito.',
						ESwalIcons.SUCCESS
					);
					closeDeleteModal();
					setSelectedBuilding(null);
				},
				onError: () => {
					genericAlert(
						'No se pudo eliminar el edificio.',
						ESwalIcons.ERROR
					);
				},
			});
		}
	};

	const handleCloseEdit = () => {
		closeEditOpen();
		setSelectedBuilding(null);
	};

	// 4. Mapeo de Columnas
	const columns: IDataTableColumn<TBuilding>[] = [
		{
			key: 'name',
			header: 'Nombre del Edificio',
			className: 'text-gray-800 font-normal p-4',
		},
		{
			key: 'color',
			header: 'Color Distintivo',
			className: 'text-gray-800 font-normal p-4 text-center',
			render: (building: TBuilding) => {
				const baseColor = building.color || '#e2e8f0';

				return (
					<div className="flex items-center justify-center">
						<span
							className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider border transition-all"
							style={{
								backgroundColor: `${baseColor}15`,
								borderColor: `${baseColor}30`,
								color: baseColor,
								filter: 'drop-shadow(0px 1px 0px rgba(0,0,0,0.05)) brightness(0.75)',
							}}
						>
							{building.color || 'N/A'}
						</span>
					</div>
				);
			},
		},
		{
			key: 'floors',
			header: 'Pisos',
			className: 'text-gray-800 font-normal p-4',
			render: (building: TBuilding) => building.floors ?? 'N/A',
		},
		{
			key: 'center',
			header: 'Centro Vinculado',
			className: 'text-gray-800 font-normal p-4',
			render: (building: TBuilding) => {
				const matchedCenter = centers?.find(
					c => c.id === building.centerId
				);
				return matchedCenter ? matchedCenter.name : 'N/A';
			},
		},
		...(canUpdate || canDelete
			? [
					{
						key: 'actions' as const,
						header: 'Acciones',
						className: 'text-center w-32 p-4',
						render: (building: TBuilding) => (
							<div className="flex items-center justify-center gap-3">
								{canUpdate && (
									<button
										onClick={() => handleOpenEdit(building)}
										className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
										title="Editar edificio"
									>
										<PencilSquareIcon className="size-5" />
									</button>
								)}
								{canDelete && (
									<button
										onClick={() => handleOpenDelete(building)}
										className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
										title="Eliminar edificio"
									>
										<TrashIcon className="size-5" />
									</button>
								)}
							</div>
						),
					},
				]
			: []),
	];

	return (
		<div className="pb-8 sm:pb-12">
			{/* ENCABEZADO */}
      <div className="flex justify-between items-end mb-5">
        <div>
					<h1 className="text-2xl font-bold text-foreground">
					Gestión de Edificios
					</h1>
					<p className="text-muted-foreground mt-1">
					Administración de la infraestructura física y edificios
					de la institución.
					</p>
				</div>
				{canCreate && (
					<Button
						onClick={openCreateModal}
						className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
					>
						<PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
						<span>Nuevo Edificio</span>
					</Button>
				)}
			</div>

			{/* TABLA DE COMPONENTE DINÁMICO */}
			<DataTable<TBuilding>
				columns={columns}
				data={buildingsResponse ?? []}
				getRowKey={building => building.id}
			/>

			{/* MODALES CRUD TOTALMENTE INTEGRADOS */}
			<CreateBuildingModal
				isOpen={isCreateOpen}
				onClose={closeCreateModal}
			/>

			<EditBuildingModal
				isOpen={isEditOpen}
				onClose={handleCloseEdit}
				building={selectedBuilding}
			/>

			<DeleteBuildingModal
				isOpen={isDeleteOpen}
				onClose={() => {
					closeDeleteModal();
					setSelectedBuilding(null);
				}}
				onConfirm={handleConfirmDelete}
				buildingName={selectedBuilding?.name}
				isPending={isDeleting}
			/>
		</div>
	);
};
