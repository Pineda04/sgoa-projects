import { useState } from 'react';
import { useGetAllAudioEquipments } from '@api/audio-equipments/useAudioEquipmentsQueries';
import { useDeleteAudioEquipmentMutation } from '@api/audio-equipments/useAudioEquipmentsMutations';
import { TAudioEquipment } from '@api/audio-equipments/audio-equipments.types';
import { CreateAudioEquipmentForm } from '../components/CreateAudioEquipmentForm';
import { EditAudioEquipmentForm } from '../components/EditAudioEquipmentForm';
import { DeleteAudioEquipmentModal } from '../components/DeleteAudioEquipmentModal';
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
    ModalBase,
    useModal,
} from '@shared';
import { useAbility } from '@config/lib';

export const ListAudioEquipments = () => {
    // 1. Control de modales y estado del equipo seleccionado
    const [isDeleteOpen, openDeleteModal, closeDeleteModal] = useModal();
    const [isCreateOpen, openCreateModal, closeCreateModal] = useModal();
    const [isEditOpen, openEditModal, closeEditOpen] = useModal();
    const [selectedEquipment, setSelectedEquipment] = useState<TAudioEquipment | null>(null);

    const ability = useAbility();
    const canCreate = ability.can('create', 'audioEquipments');
    const canUpdate = ability.can('update', 'audioEquipments');
    const canDelete = ability.can('delete', 'audioEquipments');

    // 2. Consumo de Queries y Mutaciones 
    const { data: audioResponse, isLoading } = useGetAllAudioEquipments();
    const { mutate: deleteAudioEquipment, isPending: isDeleting } = useDeleteAudioEquipmentMutation();

    if (isLoading) return <Loading />;

    // Aseguramos que data sea un array para que no rompa la DataTable si el BE responde un error
    const dataList = Array.isArray(audioResponse) ? audioResponse : [];

    // 3. Handlers para controlar la apertura de flujos
    const handleOpenEdit = (equipment: TAudioEquipment) => {
        setSelectedEquipment(equipment);
        openEditModal();
    };

    const handleOpenDelete = (equipment: TAudioEquipment) => {
        setSelectedEquipment(equipment);
        openDeleteModal();
    };

    const handleConfirmDelete = () => {
        if (selectedEquipment) {
            deleteAudioEquipment(selectedEquipment.id, {
                onSuccess: () => {
                    genericAlert(
                        'Se ha eliminado el equipo de audio con éxito.',
                        ESwalIcons.SUCCESS
                    );
                    closeDeleteModal();
                    setSelectedEquipment(null);
                },
                onError: () => {
                    genericAlert(
                        'No se pudo eliminar el equipo de audio.',
                        ESwalIcons.ERROR
                    );
                },
            });
        }
    };

    const handleCloseEdit = () => {
        closeEditOpen();
        setSelectedEquipment(null);
    };

    // 4. Mapeo de Columnas 
    const columns: IDataTableColumn<TAudioEquipment>[] = [
        {
            key: 'description',
            header: 'Descripción del Equipo de Audio',
            className: 'text-gray-800 font-normal p-4',
        },
        {
            key: 'actions',
            header: 'Acciones',
            className: 'text-center w-36 p-4',
            render: (equipment: TAudioEquipment) => (
                <div className="flex items-center justify-center gap-3">

                    {canUpdate && (
                        <button
                            onClick={() => handleOpenEdit(equipment)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                            title="Editar equipo"
                        >
                            <PencilSquareIcon className="size-5" />
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={() => handleOpenDelete(equipment)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                            title="Eliminar equipo"
                        >
                            <TrashIcon className="size-5" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="pb-8 sm:pb-12">
            {/* ENCABEZADO */}
            <div className="flex justify-between items-end mb-5">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Gestión de Equipos de Audio
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Administración del inventario de dispositivos y sistemas de audio de la institución.
                    </p>
                </div>
                {canCreate && (
                    <Button
                        onClick={openCreateModal}
                        className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
                    >
                        <PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
                        <span>Nuevo Equipo</span>
                    </Button>
                )}
            </div>

            {/* TABLA DE COMPONENTE DINÁMICO */}
            <DataTable<TAudioEquipment>
                columns={columns}
                data={dataList}
                getRowKey={equipment => equipment.id}
            />

            {/* MODALES CRUD TOTALMENTE INTEGRADOS */}
            {/* MODAL DE CREACIÓN */}
            <ModalBase isOpen={isCreateOpen} onClose={closeCreateModal}>
                <CreateAudioEquipmentForm
                    onCancel={closeCreateModal}
                    onSuccess={closeCreateModal}
                />
            </ModalBase>

            {/* MODAL DE EDICIÓN */}
            <ModalBase isOpen={isEditOpen} onClose={handleCloseEdit}>
                {selectedEquipment && (
                    <EditAudioEquipmentForm
                        audioEquipmentId={selectedEquipment.id}
                        onCancel={handleCloseEdit}
                        onSuccess={handleCloseEdit}
                    />
                )}
            </ModalBase>

            <DeleteAudioEquipmentModal
                isOpen={isDeleteOpen}
                onClose={() => {
                    closeDeleteModal();
                    setSelectedEquipment(null);
                }}
                onConfirm={handleConfirmDelete}
                description={selectedEquipment?.description}
                isPending={isDeleting}
            />
        </div>
    );
};