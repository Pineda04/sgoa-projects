import { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import { useGetPcEquipment, useUpdatePcEquipment } from '@api/pc-equipments';
import { useGetClassroomById } from '@api/classrooms';
import { Button, Loading, TagError } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import {
	buildPcEquipmentBody,
	initialPcEquipmentValues,
	pcEquipmentSchema,
	TPcEquipmentFormValues,
} from '../schemas';
import { PcEquipmentFormInputs } from './PcEquipmentFormInputs';
import { FiSave } from 'react-icons/fi';

interface EditPcEquipmentFormProps {
	pcEquipmentId: string;
	onCancel: () => void;
	onSuccess: () => void;
}

export const EditPcEquipmentForm = ({
	pcEquipmentId,
	onCancel,
	onSuccess,
}: EditPcEquipmentFormProps) => {
	const {
		data: pcEquipment,
		isLoading,
		isError,
	} = useGetPcEquipment(pcEquipmentId);

	const classroomQuery = useGetClassroomById(pcEquipment?.classroomId ?? '');

	const { updatePcEquipment, isPendingUpdate } = useUpdatePcEquipment();

	const [initialValues, setInitialValues] = useState<TPcEquipmentFormValues>(
		initialPcEquipmentValues
	);
	const hasInitialized = useRef(false);

	useEffect(() => {
		if (!pcEquipment || hasInitialized.current) return;

		hasInitialized.current = true;
		setInitialValues({
			inventoryNumber: pcEquipment.inventoryNumber,
			processor: pcEquipment.processor,
			ram: pcEquipment.ram,
			disk: pcEquipment.disk,
			brandId: pcEquipment.brandId,
			conditionId: pcEquipment.conditionId,
			monitorTypeId: pcEquipment.monitorTypeId,
			monitorSizeId: pcEquipment.monitorSizeId,
			pcTypeId: pcEquipment.pcTypeId,
			classroomId: pcEquipment.classroomId ?? '',
			departmentId: pcEquipment.departmentId ?? '',
		});
	}, [pcEquipment]);

	const formik = useFormik<TPcEquipmentFormValues>({
		enableReinitialize: true,
		initialValues,
		onSubmit: async values => {
			try {
				await updatePcEquipment({
					id: pcEquipmentId,
					body: buildPcEquipmentBody(values),
				});
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

	const isLoadingClassroom =
		Boolean(pcEquipment?.classroomId) && classroomQuery.isLoading;

	if (isLoading || isLoadingClassroom) return <Loading />;
	if (isError || !pcEquipment) return <TagError />;

	const classroomDefaultOption =
		pcEquipment.classroomId && classroomQuery.data
			? {
					value: classroomQuery.data.id,
					label: classroomQuery.data.name,
				}
			: null;

	return (
		<div className="flex flex-col max-h-[calc(90vh-6rem)] min-h-0">
			<h1 className="text-xl font-bold mb-1 shrink-0">Editar Equipo</h1>
			<p className="text-sm text-gray-500 mb-3 shrink-0">
				{pcEquipment.inventoryNumber}
			</p>
			<hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

			<form
				id="edit-pc-equipment-form"
				onSubmit={formik.handleSubmit}
				className="flex-1 overflow-auto min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 py-2"
			>
				<PcEquipmentFormInputs
					formik={formik}
					disabled={isPendingUpdate}
					classroomDefaultOption={classroomDefaultOption}
				/>
			</form>

			<div className="flex justify-end gap-2 mt-2 shrink-0">
  			<Button
  				type="button"
  				onClick={onCancel}
  				disabled={isPendingUpdate}
  				variant="outline"
  			>
  				Cancelar
  			</Button>
				<Button
					type="submit"
					form="edit-pc-equipment-form"
					disabled={isPendingUpdate}
					className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
				>
          {!isPendingUpdate && <FiSave className="size-4" />}
					<span>
						{isPendingUpdate
							? 'Guardando...'
							: 'Actualizar Equipo'}
					</span>
				</Button>
			</div>
		</div>
	);
};
