import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { ArrowLeft, Save } from 'lucide-react';
import { CourseFormInputs } from '../components/CourseFormInputs';
import { CourseDepartmentSelect } from '../components/CourseDepartmentSelect';
import { TCreateCourse, useCreateCourse } from '@api/courses';
import { courseCreateSchema } from '../schemas';
import { errorsFormik } from '@shared/utils';
import { Button } from '@shared/components';

const initialValues: TCreateCourse = {
	name: '',
	code: '',
	uvs: 1,
	activeStatus: true,
	departmentId: '',
};

export const CreateCourse = () => {
	const navigate = useNavigate();
	const createMutation = useCreateCourse();

	const formik = useFormik<TCreateCourse>({
		initialValues,
		onSubmit: async values => {
			try {
				await createMutation.mutateAsync(values);
				formik.resetForm();
				navigate(-1);
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

	const handleCancel = () => {
		formik.resetForm();
		navigate(-1);
	};

	return (
		<div className="min-h-screen bg-background/50">
			<div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
				{/* Back button - solo visible en móvil */}
				<button
					onClick={() => navigate('/home')}
					className="md:hidden flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
				>
					<ArrowLeft className="size-4" />
					Volver
				</button>

				{/* Card principal */}
				<article className="bg-card border border-border rounded-xl shadow-lg shadow-primary/5 overflow-hidden">
					{/* Header */}
					<header className="sticky top-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-4 md:px-6">
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
							<div className="flex-1 min-w-0">
								<h1 className="text-lg md:text-xl font-bold text-foreground truncate">
									Nueva Clase
								</h1>
								<p className="text-sm text-muted-foreground truncate">
									Crear una nueva asignatura
								</p>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={handleCancel}
									disabled={createMutation.isPending}
									className="border-destructive text-destructive hover:bg-destructive/10 hover:border-destructive"
								>
									<ArrowLeft className="size-4 mr-1" />
									Cancelar
								</Button>
								<Button
									type="submit"
									form="course-form"
									size="sm"
									disabled={createMutation.isPending}
									className="bg-green-600 hover:bg-green-700"
								>
									<Save className="size-4 mr-1" />
									{createMutation.isPending ? 'Guardando' : 'Guardar'}
								</Button>
							</div>
						</div>
					</header>

					{/* Formulario */}
					<form
						id="course-form"
						onSubmit={formik.handleSubmit}
						className="p-4 md:p-6"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
							<CourseFormInputs formik={formik} />

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
					</form>
				</article>
			</div>
		</div>
	);
};
