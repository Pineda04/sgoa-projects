import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { useState } from 'react';
import { ArrowLeft, Save, Pencil, X } from 'lucide-react';
import { Loading, Error } from '@components';
import { Button } from '@components/ui/button';
import { useGetCourseById, useUpdateCourse } from '../hooks/useCourses';
import type { TCourseWithDepartment } from '@features/teachers';
import { courseUpdateSchema, TUpdateCourse } from '../schemas/course.schema';
import { errorsFormik } from '@utils/errors-formik';

export const CourseEdit = () => {
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const courseId = id ?? '';
	const [isEditing, setIsEditing] = useState(false);

	const courseQuery = useGetCourseById(courseId);
	const updateMutation = useUpdateCourse();

	const course = courseQuery.data as TCourseWithDepartment | undefined;

	const getInitialValues = (): TUpdateCourse => {
		if (!course) {
			return {
				name: '',
				code: '',
				uvs: undefined,
				activeStatus: true,
				departmentId: '',
			};
		}

		return {
			name: course.name,
			code: course.code,
			uvs: course.uvs,
			activeStatus: course.activeStatus,
			departmentId: course.departmentId,
		};
	};

	const formik = useFormik<TUpdateCourse>({
		initialValues: getInitialValues(),
		enableReinitialize: true,
		onSubmit: async values => {
			if (!course) return;

			const changedFields: Partial<TUpdateCourse> = {};

			if (values.name !== course.name) changedFields.name = values.name;
			if (values.code !== course.code) changedFields.code = values.code;
			if (values.uvs !== course.uvs) changedFields.uvs = values.uvs;
			if (values.activeStatus !== course.activeStatus)
				changedFields.activeStatus = values.activeStatus;

			if (Object.keys(changedFields).length === 0) {
				setIsEditing(false);
				return;
			}

			try {
				await updateMutation.mutateAsync({
					id: courseId,
					data: changedFields,
				});

				formik.resetForm();
				courseQuery.refetch();

				setIsEditing(false);
			} catch {
				// Error handling done in mutation
			}
		},
		validate: values => {
			const result = courseUpdateSchema.safeParse(values);
			if (result.success) return;
			return errorsFormik<TUpdateCourse>(result);
		},
	});

	const handleCancel = () => {
		formik.resetForm();
		setIsEditing(false);
	};

	const getDepartmentName = () => {
		if (!course?.departmentId) return 'Sin departamento';
		return course.department?.name ?? course.departmentId;
	};

	if (courseQuery.isLoading) return <Loading />;
	if (courseQuery.isError)
		return (
			<Error
				error={
					courseQuery.error?.message ??
					'Error al cargar la asignatura'
				}
			/>
		);

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
									{course?.code} - {course?.name}
								</h1>
								<p className="text-sm text-muted-foreground truncate">
									{getDepartmentName()}
								</p>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								{isEditing ? (
									<>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={handleCancel}
											disabled={updateMutation.isPending}
											className="border-destructive text-destructive hover:bg-destructive/10 hover:border-destructive"
										>
											<X className="size-4 mr-1" />
											Cancelar
										</Button>
										<Button
											type="submit"
											form="course-form"
											size="sm"
											disabled={updateMutation.isPending}
											className="bg-green-600 hover:bg-green-700"
										>
											<Save className="size-4 mr-1" />
											{updateMutation.isPending
												? 'Guardando'
												: 'Guardar'}
										</Button>
									</>
								) : (
									<Button
										type="button"
										size="sm"
										onClick={() => setIsEditing(true)}
									>
										<Pencil className="size-4 mr-1" />
										Editar
									</Button>
								)}
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
							{/* Código */}
							<div className="space-y-2">
								<label
									htmlFor="code"
									className="text-sm font-medium text-foreground"
								>
									Código
								</label>
								<input
									id="code"
									type="text"
									name="code"
									value={
										formik.values.code ?? course?.code ?? ''
									}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									disabled={!isEditing}
									placeholder="Ingrese el código"
									className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground"
								/>
								{formik.touched.code && formik.errors.code ? (
									<p className="text-xs text-destructive">
										{formik.errors.code}
									</p>
								) : null}
							</div>

							{/* Nombre */}
							<div className="space-y-2">
								<label
									htmlFor="name"
									className="text-sm font-medium text-foreground"
								>
									Nombre
								</label>
								<input
									id="name"
									type="text"
									name="name"
									value={
										formik.values.name ?? course?.name ?? ''
									}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									disabled={!isEditing}
									placeholder="Ingrese el nombre"
									className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground"
								/>
								{formik.touched.name && formik.errors.name ? (
									<p className="text-xs text-destructive">
										{formik.errors.name}
									</p>
								) : null}
							</div>

							{/* UVs */}
							<div className="space-y-2">
								<label
									htmlFor="uvs"
									className="text-sm font-medium text-foreground"
								>
									UVs
								</label>
								<input
									id="uvs"
									type="number"
									name="uvs"
									min={1}
									max={5}
									value={
										formik.values.uvs ?? course?.uvs ?? ''
									}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									disabled={!isEditing}
									placeholder="1-5"
									className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground"
								/>
								{formik.touched.uvs && formik.errors.uvs ? (
									<p className="text-xs text-destructive">
										{formik.errors.uvs}
									</p>
								) : null}
							</div>

							{/* Estado */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-foreground">
									Estado
								</label>
								<label className="flex items-center gap-3 cursor-pointer mt-2">
									<div className="relative">
										<input
											type="checkbox"
											name="activeStatus"
											checked={
												formik.values.activeStatus ??
												course?.activeStatus ??
												false
											}
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											disabled={!isEditing}
											className="sr-only peer"
										/>
										<div className="w-11 h-6 bg-muted border border-border rounded-full peer-checked:bg-green-600 peer-checked:border-green-600 transition-colors" />
										<div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5" />
									</div>
									<span className="text-sm text-foreground peer-disabled:text-muted-foreground">
										{(formik.values.activeStatus ??
										course?.activeStatus)
											? 'Activo'
											: 'Inactivo'}
									</span>
								</label>
							</div>

							{/* Departamento - full width en mobile */}
							<div className="md:col-span-2 space-y-2">
								<label className="text-sm font-medium text-foreground">
									Departamento
								</label>
								<input
									type="text"
									value={getDepartmentName()}
									disabled
									className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm text-muted-foreground"
								/>
								<p className="text-xs text-muted-foreground">
									<strong>Nota:</strong> Las clases son compartidas con todos los centros.
									Si cambia el estado a inactivo/a, se cambiará en todos los centros por igual.
								</p>
							</div>
						</div>
					</form>
				</article>

				{/* Footer info */}
				<p className="text-xs text-muted-foreground text-center mt-4 md:hidden">
					Toca &quot;Editar&quot; para modificar los campos
				</p>
			</div>
		</div>
	);
};
