import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useCreateClassroomMutation } from '@api/classrooms';
import { Button } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import {
	buildClassroomBody,
	classroomSchema,
	initialClassroomValues,
	TClassroomFormValues,
} from '../schemas';
import { ClassroomFormInputs } from '../components';
import { FiSave } from 'react-icons/fi';

export const CreateClassroom = () => {
	const navigate = useNavigate();
	const { createClassroom, isPendingCreate } = useCreateClassroomMutation();

	const formik = useFormik<TClassroomFormValues>({
		initialValues: initialClassroomValues,
		onSubmit: async values => {
			try {
				await createClassroom(buildClassroomBody(values));
				navigate('/infrastructure/classrooms');
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

	return (
		<div className="p-10 rounded shadow-md w-full max-w-4xl h-fit bg-white m-auto mb-8">
			<h1 className="text-2xl font-bold text-foreground">Nueva Aula</h1>
			<p className="text-muted-foreground mt-1 mb-6">
				Registrar una nueva aula en la infraestructura.
			</p>

			<form
				onSubmit={formik.handleSubmit}
				className="grid grid-cols-1 md:grid-cols-2 gap-4"
			>
				<ClassroomFormInputs
					formik={formik}
					disabled={isPendingCreate}
				/>

				<div className="flex justify-end gap-2 mt-4 md:col-span-2">
					<Button
						type="button"
						variant="outline"
						onClick={() => navigate('/infrastructure/classrooms')}
						disabled={isPendingCreate}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={isPendingCreate}
						className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
					>
						{!isPendingCreate && <FiSave className="size-4" />}
						<span>
							{isPendingCreate ? 'Guardando...' : 'Guardar Aula'}
						</span>
					</Button>
				</div>
			</form>
		</div>
	);
};
