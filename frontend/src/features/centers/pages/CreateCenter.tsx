import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { useCreateCenterMutation } from '../hooks/mutations/useCenterMutations';
import { FiSave } from "react-icons/fi";
import { genericAlert, ESwalIcons } from '@utils';

export const CreateCenter = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const { mutate: createCenter, isPending } = useCreateCenterMutation();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        createCenter({ name }, {
            onSuccess: () => {
                genericAlert(
                    'Se ha guardado el centro operativo con éxito.',
                    ESwalIcons.SUCCESS
                );

                navigate('/rrhh/centros');
            },
            onError: (error) => {
                console.error("Error al crear:", error);
            }
        });
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Crear Nuevo Centro</h1>
            <p className="text-sm text-gray-500 mb-6">Ingresa el nombre del nuevo centro operativo.</p>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-xs">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre del Centro
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Centro Universitario Regional"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-xs focus:outline-hidden focus:ring-2 focus:ring-green-200 focus:border-transparent text-sm"
                        required
                        disabled={isPending}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/rrhh/centros')}
                        disabled={isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white "
                        disabled={isPending}
                    >
                        {!isPending && (
                            <FiSave className="size-5 transition-transform duration-300 group-hover:scale-110" />
                        )}
                        <span>{isPending ? 'Guardando...' : 'Guardar Centro'}</span>
                    </Button>
                </div>
            </form>
        </div>
    );
};