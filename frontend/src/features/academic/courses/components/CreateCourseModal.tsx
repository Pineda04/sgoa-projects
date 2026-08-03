import { useEffect } from 'react';
import { useFormik } from 'formik';
import { FiSave } from 'react-icons/fi';
import { TCreateCourse, useCreateCourse } from '@api/courses';
import { Button, ModalBase } from '@shared/components';
import { errorsFormik } from '@shared/utils';
import { courseCreateSchema } from '../schemas';
import { CourseFormInputs } from './CourseFormInputs';
import { CourseDepartmentSelect } from './CourseDepartmentSelect';

interface CreateCourseModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const initialValues: TCreateCourse = {
	name: '',
	code: '',
	uvs: 1,
	activeStatus: true,
	departmentId: '',
};

export const CreateCourseModal = ({
	isOpen,
	onClose,
}: CreateCourseModalProps) => {
	const createMutation = useCreateCourse();

	const formik = useFormik<TCreateCourse>({
		initialValues,
		onSubmit: async values => {
			try {
				await createMutation.mutateAsync(values);
				formik.resetForm();
				onClose();
			} catch {
				// Error handling done in mutation
			}
		},
		validate: values => {
			const result = courseCreateSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TCreateCourse>(result);
		},
	});

	useEffect(() => {
		if (isOpen) formik.resetForm();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold text-slate-800 mb-1">
					Nueva Clase
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					Crear una nueva asignatura.
				</p>

				<form
					id="create-course-form"
					onSubmit={formik.handleSubmit}
					className="space-y-4"
				>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<CourseFormInputs
							formik={formik}
							disabled={createMutation.isPending}
						/>

						<CourseDepartmentSelect
							value={formik.values.departmentId}
							onChange={value =>
								formik.setFieldValue('departmentId', value)
							}
							disabled={createMutation.isPending}
							error={formik.errors.departmentId}
							touched={formik.touched.departmentId}
						/>
					</div>

					<div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={createMutation.isPending}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
							disabled={createMutation.isPending}
						>
							{!createMutation.isPending && <FiSave className="size-4" />}
							<span>
								{createMutation.isPending
									? 'Guardando...'
									: 'Guardar Clase'}
							</span>
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
