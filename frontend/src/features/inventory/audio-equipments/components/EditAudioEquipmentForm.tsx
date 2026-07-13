import { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import { useGetAudioEquipmentById, useUpdateAudioEquipmentMutation } from '@api/audio-equipments';
import { Button, Loading, TagError } from '@shared/components';
import { errorsFormik, ESwalIcons, genericAlert } from '@shared/utils';
import { z } from 'zod';

const audioEquipmentSchema = z.object({
    description: z.string()
        .trim()
        .min(1, 'La descripción es requerida')  
        .trim()
        .max(100, 'La descripción no debe exceder los 100 caracteres')
});

type TAudioEquipmentFormValues = z.infer<typeof audioEquipmentSchema>;

interface EditAudioEquipmentFormProps {
    audioEquipmentId: string;
    onCancel: () => void;
    onSuccess: () => void;
}

export const EditAudioEquipmentForm = ({
    audioEquipmentId,
    onCancel,
    onSuccess,
}: EditAudioEquipmentFormProps) => {
    // 1. Obtención del registro por ID
    const {
        data: audioEquipment,
        isLoading,
        isError,
    } = useGetAudioEquipmentById(audioEquipmentId);

    // 2. Mutación de actualización
    const updateMutation = useUpdateAudioEquipmentMutation();

    const [initialValues, setInitialValues] = useState<TAudioEquipmentFormValues>({
        description: '',
    });
    const hasInitialized = useRef(false);

    // 3. Efecto para rellenar los valores cuando la consulta responda exitosamente
    useEffect(() => {
        if (!audioEquipment || hasInitialized.current) return;

        hasInitialized.current = true;
        setInitialValues({
            description: audioEquipment.description,
        });
    }, [audioEquipment]);

    const formik = useFormik<TAudioEquipmentFormValues>({
        enableReinitialize: true,
        initialValues,
       onSubmit: async values => {
    try {
        await updateMutation.mutateAsync({
            id: audioEquipmentId,
            data: values,
        }, {
            onSuccess: () => {
                genericAlert(
                    'Se ha actualizado el equipo de audio con éxito.',
                    ESwalIcons.SUCCESS
                );
                onSuccess(); 
            },
            onError: () => {
                genericAlert(
                    'No se pudo actualizar el equipo de audio.',
                    ESwalIcons.ERROR
                );
            }
        });
    } catch {
    }
},
        validate: values => {
            const result = audioEquipmentSchema.safeParse(values);
            if (result.success) return;
            return errorsFormik<TAudioEquipmentFormValues>(result);
        },
    });

    // Control de estados de carga
    if (isLoading) return <Loading />;
    if (isError || !audioEquipment) return <TagError />;

    return (
        <div className="flex flex-col max-h-[calc(90vh-6rem)] min-h-0">
            <h1 className="text-xl font-bold mb-1 shrink-0">Editar Equipo</h1>
            <p className="text-sm text-gray-500 mb-3 shrink-0">
                Modificar los detalles del equipo de audio
            </p>
            <hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

            <form
                id="edit-audio-equipment-form"
                onSubmit={formik.handleSubmit}
                className="flex-1 overflow-auto min-h-0 grid grid-cols-1 gap-4 py-2"
            >
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Descripción <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="description"
                        name="description"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.description}
                        disabled={updateMutation.isPending}
                        placeholder="Ej. Consola de audio de 12 canales"
                        className={`w-full p-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${
                            formik.touched.description && formik.errors.description
                                ? 'border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                        }`}
                    />
                    {formik.touched.description && formik.errors.description && (
                        <span className="text-xs text-red-500 font-medium">
                            {formik.errors.description}
                        </span>
                    )}
                </div>
            </form>

            <div className="flex justify-end gap-2 mt-4 shrink-0">
                <Button
                    type="submit"
                    form="edit-audio-equipment-form"
                    disabled={updateMutation.isPending}
                    className="w-30 justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-600 transition duration-300 cursor-pointer disabled:bg-gray-400"
                    variant="unstyled"
                >
                    {updateMutation.isPending ? 'Guardando...' : 'Actualizar'}
                </Button>
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={updateMutation.isPending}
                    className="w-25 justify-center bg-[#fc4c3f] text-white p-2 hover:bg-red-600 transition duration-300 cursor-pointer disabled:bg-gray-400"
                    variant="unstyled"
                >
                    Cancelar
                </Button>
            </div>
        </div>
    );
};