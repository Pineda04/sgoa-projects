import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { Loading } from '@components';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ESwalIcons, genericAlert } from '@utils/swal';
import { useGetAllCenters } from '../hooks/queries';
import { useDeleteCenterMutation } from '../hooks/mutations/useCenterMutations';
import { DeleteCenterModal } from '../components/DeleteCenterModal';

export const ListCenters = () => {
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<{ id: string; name: string } | null>(null);

    const { data: centers, isLoading } = useGetAllCenters();
    const { mutate: deleteCenter, isPending: isDeleting } = useDeleteCenterMutation();

    if (isLoading) return <Loading />;

    const openDeleteModal = (id: string, name: string) => {
        setSelectedCenter({ id, name });
        setIsModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedCenter) {
            deleteCenter(selectedCenter.id, {
                onSuccess: () => {
                    genericAlert(
                        'Se ha eliminado el centro operativo con éxito.',
                        ESwalIcons.SUCCESS
                    );
                    setIsModalOpen(false);
                    setSelectedCenter(null);
                },
                onError: (error) => {
                    console.error("Error al eliminar el centro:", error);
                    genericAlert(
                        'No se pudo eliminar el centro operativo.',
                        ESwalIcons.ERROR
                    );
                }
            });
        }
    };

    return (
        <div className="p-6 w-full max-w-7xl mx-auto">
            {/* Encabezado de la página */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Gestión de Centros</h1>
                    <p className="text-sm text-gray-500 mt-2">Administración de centros operativos de la institución.</p>
                </div>

                <Button
                    onClick={() => navigate('/rrhh/centros/nuevo')}
                    className="mt-4 sm:mt-0 bg-[oklch(0.627_0.194_149.214)] hover:bg-[oklch(0.55_0.194_149.214)] text-white flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-xs transition-all duration-300 hover:shadow-md active:scale-95 group"
                    variant="unstyled"
                >
                    <PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
                    <span>Nuevo Centro</span>
                </Button>
            </div>

            {/* Estructura de la Tabla */}
            <div className="bg-white rounded-lg shadow-xs border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[#0f4c75] border-b border-gray-200 text-sm font-semibold text-white">
                            <th className="p-4 text-center w-24">N°</th>
                            <th className="p-4">Nombre del Centro</th>
                            <th className="p-4 text-center w-32">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm bg-white">
                        {centers?.map((center: any, index: number) => (
                            <tr
                                key={center.id}
                                className="bg-white even:bg-[#f4f6f9] hover:bg-slate-100/80 transition-colors duration-150"
                            >
                                {/* Número correlativo */}
                                <td className="p-4 text-center text-gray-700 font-medium">
                                    {index + 1}
                                </td>

                                {/* Nombre del Centro */}
                                <td className="p-4 text-gray-800 font-normal">
                                    {center.name}
                                </td>

                                {/* Acciones  */}
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => navigate(`/rrhh/centros/editar/${center.id}`)}
                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                                            title="Editar centro"
                                        >
                                            <PencilSquareIcon className="size-5" />
                                        </button>

                                        <button
                                            onClick={() => openDeleteModal(center.id, center.name)}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                                            title="Eliminar centro"
                                        >
                                            <TrashIcon className="size-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DeleteCenterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
                centerName={selectedCenter?.name}
                isPending={isDeleting}
            />
        </div>
    );
};