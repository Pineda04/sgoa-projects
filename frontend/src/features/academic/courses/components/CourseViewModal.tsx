import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { Pencil, Save, X } from 'lucide-react';
import {
	TCourseWithDepartment,
	TUpdateCourse,
	useGetCourseById,
	useUpdateCourse,
} from '@api/courses';
import { courseUpdateSchema } from '../schemas';
import { errorsFormik } from '@shared/utils';
import { Button, Error, Loading, ModalBase } from '@shared/components';
import { useAbility } from '@config';

interface CourseViewModalProps {
	isOpen: boolean;
	onClose: () => void;
	courseId: string | null;
}

export const CourseViewModal = ({
	isOpen,
	onClose,
	courseId,
}: CourseViewModalProps) => {
	const ability = useAbility();
	const canUpdate = ability.can('update', 'courses');
	const [isEditing, setIsEditing] = useState(false);

	const courseQuery = useGetCourseById(courseId ?? '');
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
			if (!course || !courseId) return;

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

	useEffect(() => {
		if (isOpen) {
			setIsEditing(false);
			formik.resetForm();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const handleCancel = () => {
		formik.resetForm();
		setIsEditing(false);
	};

	const getDepartmentName = () => {
		if (!course?.departmentId) return 'Sin departamento';
		return course.department?.name ?? course.departmentId;
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mr-7 mb-1">
					<div className="min-w-0">
						<h1 className="text-xl font-bold text-slate-800 truncate">
							{course
								? `${course.code} - ${course.name}`
								: 'Detalle de Clase'}
						</h1>
						<p className="text-xs text-gray-500 truncate">
							{getDepartmentName()}
						</p>
					</div>
					<div className="flex items-center gap-2 shrink-0">
						{isEditing ? (
							<>
								<Button
									type="button"
									variant="outline"
									size="default"
									onClick={handleCancel}
									disabled={updateMutation.isPending}
									className="border-destructive text-destructive hover:bg-destructive/10 hover:border-destructive"
								>
									<X className="size-4 mr-1" />
									Cancelar
								</Button>
								<Button
									type="submit"
									form="course-view-form"
									size="default"
									disabled={updateMutation.isPending}
									className="bg-green-600 hover:bg-green-700"
								>
									<Save className="size-4 mr-1" />
									{updateMutation.isPending
										? 'Guardando'
										: 'Guardar'}
								</Button>
							</>
						) : canUpdate ? (
							<Button
								type="button"
								size="default"
								onClick={() => setIsEditing(true)}
							>
								<Pencil className="size-4 mr-1" />
								Editar
							</Button>
						) : null}
					</div>
				</div>
				<hr className="h-px my-3 bg-gray-100 border-0" />

				{courseQuery.isLoading ? (
					<Loading />
				) : courseQuery.isError ? (
					<Error
						error={
							courseQuery.error?.message ??
							'Error al cargar la asignatura'
						}
					/>
				) : (
					<form
						id="course-view-form"
						onSubmit={formik.handleSubmit}
						className="space-y-4"
					>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
									value={formik.values.code ?? ''}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									disabled={
										!isEditing || updateMutation.isPending
									}
									placeholder="Ingrese el código"
									className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground"
								/>
								{formik.touched.code && formik.errors.code ? (
									<p className="text-xs text-destructive">
										{formik.errors.code}
									</p>
								) : null}
							</div>

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
									value={formik.values.name ?? ''}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									disabled={
										!isEditing || updateMutation.isPending
									}
									placeholder="Ingrese el nombre"
									className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground"
								/>
								{formik.touched.name && formik.errors.name ? (
									<p className="text-xs text-destructive">
										{formik.errors.name}
									</p>
								) : null}
							</div>

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
									value={formik.values.uvs ?? ''}
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									disabled={
										!isEditing || updateMutation.isPending
									}
									placeholder="1-5"
									className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground"
								/>
								{formik.touched.uvs && formik.errors.uvs ? (
									<p className="text-xs text-destructive">
										{formik.errors.uvs}
									</p>
								) : null}
							</div>

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
												false
											}
											onChange={formik.handleChange}
											onBlur={formik.handleBlur}
											disabled={
												!isEditing ||
												updateMutation.isPending
											}
											className="sr-only peer"
										/>
										<div className="w-11 h-6 bg-muted border border-border rounded-full peer-checked:bg-green-600 peer-checked:border-green-600 transition-colors" />
										<div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5" />
									</div>
									<span className="text-sm text-foreground peer-disabled:text-muted-foreground">
										{formik.values.activeStatus
											? 'Activo'
											: 'Inactivo'}
									</span>
								</label>
							</div>

							<div className="sm:col-span-2 space-y-2">
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
									<strong>Nota:</strong> Las clases son
									compartidas con todos los centros. Si cambia
									el estado a inactivo/a, se cambiará en todos
									los centros por igual.
								</p>
							</div>
						</div>
					</form>
				)}
			</div>
		</ModalBase>
	);
};
