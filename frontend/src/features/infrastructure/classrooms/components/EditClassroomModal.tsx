import { useMemo } from 'react';
import { useFormik } from 'formik';
import { TClassroom, useUpdateClassroomMutation } from '@api/classrooms';
import { Button, ModalBase } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import {
	buildClassroomBody,
	classroomSchema,
	initialClassroomValues,
	TClassroomFormValues,
} from '../schemas';
import { ClassroomFormInputs } from './ClassroomFormInputs';

interface EditClassroomModalProps {
	isOpen: boolean;
	onClose: () => void;
	classroom: TClassroom | null;
}

export const EditClassroomModal = ({
	isOpen,
	onClose,
	classroom,
}: EditClassroomModalProps) => {
	const { updateClassroom, isPendingUpdate } = useUpdateClassroomMutation();

	const initialValues = useMemo<TClassroomFormValues>(() => {
		if (!classroom) return initialClassroomValues;

		return {
			name: classroom.name,
			desks: String(classroom.desks),
			tables: String(classroom.tables),
			projectors: String(classroom.projectors),
			powerOutlets: String(classroom.powerOutlets),
			lights: String(classroom.lights),
			blackboards: String(classroom.blackboards),
			lecterns: String(classroom.lecterns),
			windows: String(classroom.windows),
			maxCapacity:
				classroom.maxCapacity != null
					? String(classroom.maxCapacity)
					: '',
			activeStatus: classroom.activeStatus ?? true,
			buildingId: classroom.buildingId,
			roomTypeId: classroom.roomTypeId,
			connectivityId: classroom.connectivityId ?? '',
			audioEquipmentId: classroom.audioEquipmentId ?? '',
			conditionId: classroom.conditionId ?? '',
			digitalBlackboardId: classroom.digitalBlackboardId ?? '',
		};
	}, [classroom]);

	const formik = useFormik<TClassroomFormValues>({
		enableReinitialize: true,
		initialValues,
		onSubmit: async values => {
			if (!classroom) return;
			try {
				await updateClassroom({
					id: classroom.id,
					body: buildClassroomBody(values),
				});
				onClose();
			} catch {
				// Error handling done en la mutation
			}
		},
		validate: values => {
			const result = classroomSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TClassroomFormValues>(result);
		},
	});

	const handleClose = () => {
		formik.resetForm();
		onClose();
	};

	return (
		<ModalBase isOpen={isOpen} onClose={handleClose}>
			<div className="flex flex-col max-h-[calc(90vh-6rem)] min-h-0">
				<h1 className="text-xl font-bold mb-1 shrink-0">
					Editar Aula
				</h1>
				<p className="text-sm text-gray-500 mb-3 shrink-0">
					{classroom?.name}
				</p>
				<hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

				<form
					id="edit-classroom-form"
					onSubmit={formik.handleSubmit}
					className="flex-1 overflow-auto min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 py-2"
				>
					<ClassroomFormInputs
						formik={formik}
						disabled={isPendingUpdate}
					/>
				</form>

				<div className="flex justify-end gap-2 mt-2 shrink-0">
					<Button
						type="submit"
						form="edit-classroom-form"
						disabled={isPendingUpdate}
						className="w-30 justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition duration-300 cursor-pointer"
						variant="unstyled"
					>
						{isPendingUpdate ? 'Guardando...' : 'Actualizar'}
					</Button>
					<Button
						type="button"
						onClick={handleClose}
						disabled={isPendingUpdate}
						className="w-25 justify-center bg-[#fc4c3f] text-white p-2 hover:bg-red-300 transition duration-300 cursor-pointer"
						variant="unstyled"
					>
						Cancelar
					</Button>
				</div>
			</div>
		</ModalBase>
	);
};
