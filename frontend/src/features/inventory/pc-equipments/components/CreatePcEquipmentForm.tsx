import { useFormik } from 'formik';
import { TCreatePcEquipment, useCreatePcEquipment } from '@api/pc-equipments';
import { Button } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import {
	initialPcEquipmentValues,
	pcEquipmentSchema,
	TPcEquipmentFormValues,
} from '../schemas';
import { PcEquipmentFormInputs } from './PcEquipmentFormInputs';

interface CreatePcEquipmentFormProps {
	onCancel: () => void;
	onSuccess: () => void;
}

const buildBody = (values: TPcEquipmentFormValues): TCreatePcEquipment => ({
	inventoryNumber: values.inventoryNumber.trim(),
	processor: values.processor.trim(),
	ram: values.ram.trim(),
	disk: values.disk.trim(),
	brandId: values.brandId,
	conditionId: values.conditionId,
	monitorTypeId: values.monitorTypeId,
	monitorSizeId: values.monitorSizeId,
	pcTypeId: values.pcTypeId,
	classroomId: values.classroomId || undefined,
	departmentId: values.departmentId || undefined,
});

export const CreatePcEquipmentForm = ({
	onCancel,
	onSuccess,
}: CreatePcEquipmentFormProps) => {
	const createMutation = useCreatePcEquipment();

	const formik = useFormik<TPcEquipmentFormValues>({
		initialValues: initialPcEquipmentValues,
		onSubmit: async values => {
			await createMutation.mutateAsync(buildBody(values), {
				onSuccess: () => {
					formik.resetForm();
					onSuccess();
				},
			});
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
					type="submit"
					form="create-pc-equipment-form"
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
