import { useState } from 'react';
import { useGetAllCenters } from '@api/centers/useCentersQueries';
import { useDeleteCenterMutation } from '@api/centers/useCentersMutations';
import { TCenter } from '@api/centers/centers.types';
import { CreateCenterModal } from '../components/CreateCenterModal';
import { EditCenterModal } from '../components/EditCenterModal';
import { DeleteCenterModal } from '../components/DeleteCenterModal';
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

export const ListCenters = () => {
	const [isModalOpen, openModal, closeModal] = useModal();
	const [isCreateModalOpen, openCreateModal, closeCreateModal] = useModal();
	const [isEditModalOpen, openEditModal, closeEditModal] = useModal();
	const [selectedCenter, setSelectedCenter] = useState<TCenter | null>(null);

	const { data: centers, isLoading } = useGetAllCenters();
	const { mutate: deleteCenter, isPending: isDeleting } =
		useDeleteCenterMutation();

	if (isLoading) return <Loading />;

	const openDeleteModal = (center: TCenter) => {
		setSelectedCenter(center);
		openModal();
	};

	const handleOpenEditModal = (center: TCenter) => {
		setSelectedCenter(center);
		openEditModal();
	};

	const handleConfirmDelete = () => {
		if (selectedCenter) {
			deleteCenter(selectedCenter.id, {
				onSuccess: () => {
					genericAlert(
						'Se ha eliminado el centro operativo con éxito.',
						ESwalIcons.SUCCESS
					);
					closeModal();
					setSelectedCenter(null);
				},
				onError: () => {
					genericAlert(
						'No se pudo eliminar el centro operativo.',
						ESwalIcons.ERROR
					);
				},
			});
		}
	};

	const handleCloseEdit = () => {
		closeEditModal();
		setSelectedCenter(null);
	};

	const columns: IDataTableColumn<TCenter>[] = [
		{
			key: 'name',
			header: 'Nombre del Centro',
			className: 'text-gray-800 font-normal p-4',
		},
		{
			key: 'actions',
			header: 'Acciones',
			className: 'text-center w-32 p-4',
			render: (center: TCenter) => (
				<div className="flex items-center justify-center gap-3">
					<button
						onClick={() => handleOpenEditModal(center)}
						className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
						title="Editar centro"
					>
						<PencilSquareIcon className="size-5" />
					</button>
					<button
						onClick={() => openDeleteModal(center)}
						className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
						title="Eliminar centro"
					>
						<TrashIcon className="size-5" />
					</button>
				</div>
			),
		},
	];

	return (
		<div className="p-6 w-full max-w-7xl mx-auto">
			<div className="flex flex-col sm:flex-row justify-between items-end mb-6">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Gestión de Centros
					</h1>
					<p className="text-muted-foreground mt-1">
						Administración de centros operativos de la institución.
					</p>
				</div>
				<Button
					onClick={openCreateModal}
					className="mt-4 sm:mt-0 bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-xs transition-all duration-300 hover:shadow-md active:scale-95 group"
				>
					<PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
					<span>Nuevo Centro</span>
				</Button>
			</div>

			<DataTable<TCenter>
				columns={columns}
				data={centers ?? []}
				getRowKey={center => center.id}
			/>

			<CreateCenterModal
				isOpen={isCreateModalOpen}
				onClose={closeCreateModal}
			/>

			<EditCenterModal
				isOpen={isEditModalOpen}
				onClose={handleCloseEdit}
				center={selectedCenter}
			/>

			<DeleteCenterModal
				isOpen={isModalOpen}
				onClose={() => {
					closeModal();
					setSelectedCenter(null);
				}}
				onConfirm={handleConfirmDelete}
				centerName={selectedCenter?.name}
				isPending={isDeleting}
			/>
		</div>
	);
};
