import { useFormik } from 'formik';
import { useCreateClassroomMutation } from '@api/classrooms';
import { Button, ModalBase } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import {
	buildClassroomBody,
	classroomSchema,
	initialClassroomValues,
	TClassroomFormValues,
} from '../schemas';
import { ClassroomFormInputs } from './ClassroomFormInputs';

interface CreateClassroomModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const CreateClassroomModal = ({
	isOpen,
	onClose,
}: CreateClassroomModalProps) => {
	const { createClassroom, isPendingCreate } = useCreateClassroomMutation();

	const formik = useFormik<TClassroomFormValues>({
		initialValues: initialClassroomValues,
		onSubmit: async values => {
			try {
				await createClassroom(buildClassroomBody(values));
				formik.resetForm();
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
				<h1 className="text-xl font-bold mb-1 shrink-0">Nueva Aula</h1>
				<p className="text-sm text-gray-500 mb-3 shrink-0">
					Registrar una nueva aula en la infraestructura
				</p>
				<hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

				<form
					id="create-classroom-form"
					onSubmit={formik.handleSubmit}
					className="flex-1 overflow-auto min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 py-2"
				>
					<ClassroomFormInputs
						formik={formik}
						disabled={isPendingCreate}
					/>
				</form>

				<div className="flex justify-end gap-2 mt-2 shrink-0">
					<Button
						type="submit"
						form="create-classroom-form"
						disabled={isPendingCreate}
						className="w-30 justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition duration-300 cursor-pointer"
						variant="unstyled"
					>
						{isPendingCreate ? 'Guardando...' : 'Guardar'}
					</Button>
					<Button
						type="button"
						onClick={handleClose}
						disabled={isPendingCreate}
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
