import { useFormik } from 'formik';
import { useCreateDigitalBlackboard } from '@api/digital-blackboards';
import { Button } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import {
	buildDigitalBlackboardBody,
	digitalBlackboardSchema,
	initialDigitalBlackboardValues,
	TDigitalBlackboardFormValues,
} from '../schemas';
import { DigitalBlackboardFormInputs } from './DigitalBlackboardFormInputs';

interface CreateDigitalBlackboardFormProps {
	onCancel: () => void;
	onSuccess: () => void;
}

export const CreateDigitalBlackboardForm = ({
	onCancel,
	onSuccess,
}: CreateDigitalBlackboardFormProps) => {
	const createMutation = useCreateDigitalBlackboard();

	const formik = useFormik<TDigitalBlackboardFormValues>({
		initialValues: initialDigitalBlackboardValues,
		onSubmit: async values => {
			try {
				await createMutation.mutateAsync(
					buildDigitalBlackboardBody(values)
				);
				formik.resetForm();
				onSuccess();
			} catch {
				// Manejo de error en la mutation
			}
		},
		validate: values => {
			const result = digitalBlackboardSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TDigitalBlackboardFormValues>(result);
		},
	});

	return (
		<div className="flex flex-col max-h-[calc(90vh-6rem)] min-h-0">
			<h1 className="text-xl font-bold mb-1 shrink-0">
				Nueva Pizarra Digital
			</h1>
			<p className="text-sm text-gray-500 mb-3 shrink-0">
				Registrar una nueva pizarra digital
			</p>
			<hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

			<form
				id="create-digital-blackboard-form"
				onSubmit={formik.handleSubmit}
				className="flex-1 overflow-auto min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 py-2"
			>
				<DigitalBlackboardFormInputs
					formik={formik}
					disabled={createMutation.isPending}
				/>
			</form>

			<div className="flex justify-end gap-2 mt-2 shrink-0">
				<Button
					type="submit"
					form="create-digital-blackboard-form"
					disabled={createMutation.isPending}
					className="w-30 justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition duration-300 cursor-pointer"
					variant="unstyled"
				>
					{createMutation.isPending ? 'Guardando...' : 'Guardar'}
				</Button>
				<Button
					type="button"
					onClick={onCancel}
					disabled={createMutation.isPending}
					className="w-25 justify-center bg-[#fc4c3f] text-white p-2 hover:bg-red-300 transition duration-300 cursor-pointer"
					variant="unstyled"
				>
					Cancelar
				</Button>
			</div>
		</div>
	);
};
