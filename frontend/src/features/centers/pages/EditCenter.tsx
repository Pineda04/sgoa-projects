import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { Loading } from '@components';
import { useGetCenterById } from '../hooks/queries/getCenters';
import { useUpdateCenterMutation } from '../hooks/mutations/useCenterMutations';
import { FiSave } from 'react-icons/fi';
import { ESwalIcons, genericAlert } from '@utils/swal';

export const EditCenter = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');

    const centerInfo = useGetCenterById(id ?? '');
    const { mutate: updateCenter, isPending: isUpdating } = useUpdateCenterMutation();

    useEffect(() => {
        if (centerInfo.data?.name) {
            setName(centerInfo.data.name);
        }
    }, [centerInfo.data]);

    if (centerInfo.isLoading || isUpdating) return <Loading />;

       const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !id) return;

        updateCenter(
            { id, data: { name } },
            {
                onSuccess: () => {
                    genericAlert(
                        'Se ha actualizado el centro operativo con éxito.',
                        ESwalIcons.SUCCESS
                    );
                    navigate('/rrhh/centros');
                },
                onError: (error) => {
                    console.error("Error al actualizar el centro:", error);
                }
            }
        );
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Editar Centro</h1>
            <p className="text-sm text-gray-500 mb-6">Modifica la información correspondiente al centro seleccionado.</p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre del Centro
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/rrhh/centros')}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white "
                    >
                        <FiSave />
                        <span>Actualizar Centro</span>
                    </Button>
                </div>
            </form>
        </div>
    );
};