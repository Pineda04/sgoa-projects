import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Loading } from '@components';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DataTable } from '@components/ui/DataTable'; 
import type { TCenter } from '../types'; 
import { CreateCenterModal } from '../components/CreateCenterModal';
import { EditCenterModal } from '../components/EditCenterModal';
import { DeleteCenterModal } from '../components/DeleteCenterModal';
import { useGetAllCenters } from '../hooks/queries';
import { useDeleteCenterMutation } from '../hooks/mutations/useCenterMutations';
import { ESwalIcons, genericAlert } from '@utils/swal';

export const ListCenters = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<TCenter | null>(null);

    const { data: centers, isLoading } = useGetAllCenters();
    const { mutate: deleteCenter, isPending: isDeleting } = useDeleteCenterMutation();

    if (isLoading) return <Loading />;

    const openDeleteModal = (center: TCenter) => {
        setSelectedCenter(center);
        setIsModalOpen(true);
    };

    const openEditModal = (center: TCenter) => {
        setSelectedCenter(center);
        setIsEditModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedCenter) {
            deleteCenter(selectedCenter.id, {
                onSuccess: () => {
                    genericAlert('Se ha eliminado el centro operativo con éxito.', ESwalIcons.SUCCESS);
                    setIsModalOpen(false);
                    setSelectedCenter(null);
                },
                onError: (error) => {
                    console.error("Error al eliminar el centro:", error);
                    genericAlert('No se pudo eliminar el centro operativo.', ESwalIcons.ERROR);
                }
            });
        }
    };

    // 1. Definimos las columnas
   const columns = [
        {
            key: 'name',
            header: 'Nombre del Centro',
            accessorKey: 'name',
            className: 'text-gray-800 font-normal p-4',
        },
        {
            key: 'actions',
            header: 'Acciones',
            accessorKey: 'actions',
            className: 'text-center w-32 p-4',
            render: (center: TCenter) => (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => openEditModal(center)}
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
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gestión de Centros</h1>
                    <p className="text-sm text-gray-500 mt-2">Administración de centros operativos de la institución.</p>
                </div>

                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 sm:mt-0 bg-[oklch(0.627_0.194_149.214)] hover:bg-[oklch(0.55_0.194_149.214)] text-white flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-xs transition-all duration-300 hover:shadow-md active:scale-95 group"
                    variant="unstyled"
                >
                    <PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
                    <span>Nuevo Centro</span>
                </Button>
            </div>

            <DataTable 
                columns={columns as any} 
                data={(centers || []) as any}
                getRowKey={(center: any) => center.id} 
            />

            {/* Modales */}
            <CreateCenterModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <EditCenterModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCenter(null);
                }}
                center={selectedCenter}
            />

            <DeleteCenterModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedCenter(null);
                }}
                onConfirm={handleConfirmDelete}
                centerName={selectedCenter?.name}
                isPending={isDeleting}
            />
        </div>
    );
};