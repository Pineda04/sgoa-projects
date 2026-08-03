import { useFormik } from 'formik';
import { useCreatePcEquipment } from '@api/pc-equipments';
import { Button } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import {
	buildPcEquipmentBody,
	initialPcEquipmentValues,
	pcEquipmentSchema,
	TPcEquipmentFormValues,
} from '../schemas';
import { PcEquipmentFormInputs } from './PcEquipmentFormInputs';
import { FiSave } from 'react-icons/fi';

interface CreatePcEquipmentFormProps {
	onCancel: () => void;
	onSuccess: () => void;
}

export const CreatePcEquipmentForm = ({
	onCancel,
	onSuccess,
}: CreatePcEquipmentFormProps) => {
	const createMutation = useCreatePcEquipment();

	const formik = useFormik<TPcEquipmentFormValues>({
		initialValues: initialPcEquipmentValues,
		onSubmit: async values => {
			try {
				await createMutation.mutateAsync(buildPcEquipmentBody(values));
				formik.resetForm();
				onSuccess();
			} catch {
				// Error handling done en la mutation
			}
		},
		validate: values => {
			const result = pcEquipmentSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TPcEquipmentFormValues>(result);
		},
	});

	return (
		<div className="flex flex-col max-h-[calc(90vh-6rem)] min-h-0">
			<h1 className="text-xl font-bold mb-1 shrink-0">Nuevo Equipo</h1>
			<p className="text-sm text-gray-500 mb-3 shrink-0">
				Registrar un nuevo equipo de cómputo
			</p>
			<hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

			<form
				id="create-pc-equipment-form"
				onSubmit={formik.handleSubmit}
				className="flex-1 overflow-auto min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 py-2"
			>
				<PcEquipmentFormInputs
					formik={formik}
					disabled={createMutation.isPending}
				/>
			</form>

			<div className="flex justify-end gap-2 mt-2 shrink-0">
				<Button
					type="button"
					onClick={onCancel}
					disabled={createMutation.isPending}
					variant="outline"
				>
					Cancelar
				</Button>
				<Button
					type="submit"
					form="create-pc-equipment-form"
					disabled={createMutation.isPending}
					className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
				>
					{!createMutation.isPending && <FiSave className="size-4" />}
					<span>
						{createMutation.isPending
							? 'Guardando...'
							: 'Guardar Equipo'}
					</span>
				</Button>
			</div>
		</div>
	);
};
