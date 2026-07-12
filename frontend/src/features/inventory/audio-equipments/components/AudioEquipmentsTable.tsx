import { useCallback, useState } from 'react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataTable, IDataTableColumn, ModalBase, useModal } from '@shared';
import { TAudioEquipment, useDeleteAudioEquipmentMutation } from '@api/audio-equipments';
import { DeleteAudioEquipmentModal } from './DeleteAudioEquipmentModal';
import { EditAudioEquipmentForm } from './EditAudioEquipmentForm';

interface AudioEquipmentsTableProps {
    data: TAudioEquipment[];
    isLoading: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

export const AudioEquipmentsTable = ({
    data,
    isLoading,
    canUpdate,
    canDelete,
}: AudioEquipmentsTableProps) => {
    // Hooks de control de modales e ítems seleccionados
    const [isDeleteOpen, openDelete, closeDelete] = useModal();
    const [selectedAudioEquipment, setSelectedAudioEquipment] = useState<TAudioEquipment | undefined>();

    const [isEditOpen, openEdit, closeEdit] = useModal();
    const [editingAudioEquipmentId, setEditingPcEquipmentId] = useState<string | null>(null);
    
    // Mutación de eliminación
    const deleteAudioEquipmentMutation = useDeleteAudioEquipmentMutation();

    const handleOpenDelete = useCallback(
        (equipment: TAudioEquipment) => {
            setSelectedAudioEquipment(equipment);
            openDelete();
        },
        [openDelete]
    );

    const handleCloseDelete = () => {
        closeDelete();
        setSelectedAudioEquipment(undefined);
    };

    const handleConfirmDelete = async () => {
        if (!selectedAudioEquipment) return;
        await deleteAudioEquipmentMutation.mutateAsync(selectedAudioEquipment.id);
        handleCloseDelete();
    };

    const handleOpenEdit = useCallback(
        (equipment: TAudioEquipment) => {
            setEditingPcEquipmentId(equipment.id);
            openEdit();
        },
        [openEdit]
    );

    const handleCloseEdit = () => {
        closeEdit();
        setEditingPcEquipmentId(null);
    };


    // Definición de Columnas de la DataTable
    const columns: IDataTableColumn<TAudioEquipment>[] = [
        {
            key: 'id',
            header: 'ID / Código',
            mobileLabel: 'ID',
            hiddenOnMobile: true,
            render: row => <span className="font-mono text-xs text-gray-500">{row.id.substring(0, 8)}...</span>
        },
        {
            key: 'description',
            header: 'Descripción del Equipo',
            mobileLabel: 'Descripción',
        },
        {
            key: 'actions',
            header: 'Acciones',
            mobileLabel: 'Acciones',
            render: (row: TAudioEquipment) => (
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
    ];

    return (
        <>
            <DataTable<TAudioEquipment>
                columns={columns}
                data={data}
                getRowKey={row => row.id}
                loading={isLoading}
                emptyMessage="No hay equipos de audio registrados"
                showRowNumber={false}
            />

            {/* Modal de Confirmación de Borrado */}
            <DeleteAudioEquipmentModal
                isOpen={isDeleteOpen}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                description={selectedAudioEquipment?.description}
                isPending={deleteAudioEquipmentMutation.isPending}
            />

            {/* Modal de Edición de Formulario */}
            <ModalBase isOpen={isEditOpen} onClose={handleCloseEdit}>
                {editingAudioEquipmentId && (
                    <EditAudioEquipmentForm
                        audioEquipmentId={editingAudioEquipmentId}
                        onCancel={handleCloseEdit}
                        onSuccess={handleCloseEdit}
                    />
                )}
            </ModalBase>
        </>
    );
};