import { useFormik } from 'formik';
import { useCreateAirConditioner } from '@api/air-conditioners';
import { Button } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import {
	airConditionerSchema,
	buildAirConditionerBody,
	initialAirConditionerValues,
	TAirConditionerFormValues,
} from '../schemas';
import { AirConditionerFormInputs } from './AirConditionerFormInputs';
import { FiSave } from 'react-icons/fi';

interface CreateAirConditionerFormProps {
	onCancel: () => void;
	onSuccess: () => void;
}

export const CreateAirConditionerForm = ({
	onCancel,
	onSuccess,
}: CreateAirConditionerFormProps) => {
	const createMutation = useCreateAirConditioner();

	const formik = useFormik<TAirConditionerFormValues>({
		initialValues: initialAirConditionerValues,
		onSubmit: async values => {
			try {
				await createMutation.mutateAsync(
					buildAirConditionerBody(values)
				);
				formik.resetForm();
				onSuccess();
			} catch {
				// Manejo de error en la mutation
			}
		},
		validate: values => {
			const result = airConditionerSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TAirConditionerFormValues>(result);
		},
	});

	return (
		<div className="flex flex-col max-h-[calc(90vh-6rem)] min-h-0">
			<h1 className="text-xl font-bold mb-1 shrink-0">
				Nuevo Aire Acondicionado
			</h1>
			<p className="text-sm text-gray-500 mb-3 shrink-0">
				Registrar un nuevo aire acondicionado
			</p>
			<hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

			<form
				id="create-air-conditioner-form"
				onSubmit={formik.handleSubmit}
				className="flex-1 overflow-auto min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 py-2"
			>
				<AirConditionerFormInputs
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
					form="create-air-conditioner-form"
					disabled={createMutation.isPending}
					className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
				>
					{!createMutation.isPending && <FiSave className="size-4" />}
					<span>
						{createMutation.isPending
							? 'Guardando...'
							: 'Guardar Aire Acondicionado'}
					</span>
				</Button>
			</div>
		</div>
	);
};
