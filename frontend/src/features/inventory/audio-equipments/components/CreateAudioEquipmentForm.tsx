import { useFormik } from 'formik';
import { useCreateAudioEquipmentMutation } from '@api/audio-equipments';
import { Button } from '@shared/components';
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

interface CreateAudioEquipmentFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export const CreateAudioEquipmentForm = ({
    onCancel,
    onSuccess,
}: CreateAudioEquipmentFormProps) => {
    const createMutation = useCreateAudioEquipmentMutation();

    const formik = useFormik<TAudioEquipmentFormValues>({
        initialValues: {
            description: '',
        },
        onSubmit: async values => {
            try {
                await createMutation.mutateAsync(values, {
                    onSuccess: () => {
                        genericAlert(
                            'Se ha registrado el equipo de audio con éxito.',
                            ESwalIcons.SUCCESS
                        );
                        formik.resetForm();
                        onSuccess();
                    },
                    onError: () => {
                        genericAlert(
                            'No se pudo registrar el equipo de audio.',
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

    return (
        <div className="flex flex-col max-h-[calc(90vh-6rem)] min-h-0">
            <h1 className="text-xl font-bold mb-1 shrink-0">Nuevo Equipo</h1>
            <p className="text-sm text-gray-500 mb-3 shrink-0">
                Registrar un nuevo equipo de audio
            </p>
            <hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

            <form
                id="create-audio-equipment-form"
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
                        disabled={createMutation.isPending}
                        placeholder="Ej. Consola de audio de 12 canales"
                        className={`w-full p-2 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 ${formik.touched.description && formik.errors.description
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
                    form="create-audio-equipment-form"
                    disabled={createMutation.isPending}
                    className="w-30 justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-600 transition duration-300 cursor-pointer disabled:bg-gray-400"
                    variant="unstyled"
                >
                    {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button
                    type="button"
                    onClick={onCancel}
                    disabled={createMutation.isPending}
                    className="w-25 justify-center bg-[#fc4c3f] text-white p-2 hover:bg-red-600 transition duration-300 cursor-pointer disabled:bg-gray-400"
                    variant="unstyled"
                >
                    Cancelar
                </Button>
            </div>
        </div>
    );
};