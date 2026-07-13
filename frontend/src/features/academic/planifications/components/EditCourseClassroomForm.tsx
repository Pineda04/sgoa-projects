import { useFormik } from 'formik';
import { AxiosError } from 'axios';
import {
	TCourseBasicInfo,
	TEditCourseClassroom,
	useGetCourseClassroomById,
	useGetCoursesCenterDepartmentBySearchTerm,
	useUpdateCourseClassroom,
} from '@api/courses';
import { TClassroomSearch, useGetClassroomsBySearchTerm } from '@api/classrooms';
import { editCourseClassroomSchema } from '../schemas';
import { DAY_OPTIONS, generateTimeOptions } from '../utils';
import { Button, Error, Loading, SearchAsyncSelect, TagError } from '@shared/components';
import { ESwalIcons, customOptionsReactSelect, errorsFormik, genericAlert } from '@shared/utils';

interface IEditCourseClassroomFormProps {
	courseClassroomId: string;
	onCancel: () => void;
	onSuccess: () => void;
}

const numericFields: (keyof TEditCourseClassroom)[] = ['studentCount'];

export const EditCourseClassroomForm = ({
	courseClassroomId,
	onCancel,
	onSuccess,
}: IEditCourseClassroomFormProps) => {
	const {
		data: courseClassroom,
		isLoading,
		isError,
	} = useGetCourseClassroomById(courseClassroomId);

	const { mutateAsync: updateCourseClassroom, isPending } =
		useUpdateCourseClassroom();

	const centerDepartmentId =
		courseClassroom?.teachingSession.assignmentReport.centerDepartmentId ?? '';

	const useCoursesSearch = (searchTerm: string) =>
		useGetCoursesCenterDepartmentBySearchTerm(centerDepartmentId, searchTerm);

	const useClassroomsSearch = (
		searchTerm: string,
		page?: number,
		size?: number
	) => useGetClassroomsBySearchTerm(searchTerm, page, size);

	const formik = useFormik<TEditCourseClassroom>({
		enableReinitialize: true,
		initialValues: {
			courseId: courseClassroom?.course.id ?? '',
			courseCode: courseClassroom?.course.code ?? '',
			courseName: courseClassroom?.course.name ?? '',
			classroomId: courseClassroom?.classroomId ?? '',
			classroomName: courseClassroom?.classroom.name ?? '',
			section: courseClassroom?.section ?? '',
			days: courseClassroom?.days ?? '',
			studentCount: courseClassroom?.studentCount ?? 1,
			nearGraduation: courseClassroom?.nearGraduation ?? false,
			observation: courseClassroom?.observation ?? '',
		},
		validate: values => {
			const result = editCourseClassroomSchema.safeParse(values);
			if (result.success) return {};
			return errorsFormik<TEditCourseClassroom>(result);
		},
		onSubmit: async values => {
			await updateCourseClassroom(
				{
					id: courseClassroomId,
					data: {
						courseId: values.courseId,
						classroomId: values.classroomId,
						section: values.section,
						days: values.days,
						studentCount: values.studentCount,
						nearGraduation: values.nearGraduation,
						observation: values.observation,
					},
				},
				{
					onSuccess,
					onError: (error: unknown) => {
						const axiosError = error as AxiosError<{
							message: string | string[];
						}>;
						const message = axiosError.response?.data?.message;

						genericAlert(
							Array.isArray(message)
								? message.join(', ')
								: (message ??
										'Ocurrió un error al actualizar la asignatura.'),
							ESwalIcons.ERROR
						);
					},
				}
			);
		},
		validateOnChange: true,
	});

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const name = e.target.name as keyof TEditCourseClassroom;
		let value: string | number | boolean;

		if (e.target.type === 'checkbox') {
			value = (e.target as HTMLInputElement).checked;
		} else if (numericFields.includes(name)) {
			const raw = e.target.value;
			value = raw === '' ? 0 : Number(raw);
		} else {
			value = e.target.value;
		}

		formik.setFieldValue(name, value);
	};

	const handleCourseInfo = (data: TCourseBasicInfo) =>
		formik.setValues({
			...formik.values,
			courseId: data.id,
			courseCode: data.code,
			courseName: data.name,
		});

	const handleClassroomInfo = (data: TClassroomSearch) =>
		formik.setValues({
			...formik.values,
			classroomId: data.id,
			classroomName: data.name,
		});

	if (isLoading) return <Loading />;
	if (isError || !courseClassroom) return <TagError />;

	const courseDefaultOption = {
		value: courseClassroom.course.id,
		label: courseClassroom.course.code,
		data: {
			id: courseClassroom.course.id,
			code: courseClassroom.course.code,
			name: courseClassroom.course.name,
			uvs: courseClassroom.course.uvs,
			activeStatus: courseClassroom.course.activeStatus,
			department: { id: courseClassroom.course.departmentId, name: '' },
		},
	};

	const classroomDefaultOption = {
		value: courseClassroom.classroomId,
		label: courseClassroom.classroom.name,
		data: {
			id: courseClassroom.classroomId,
			name: courseClassroom.classroom.name,
			building: {
				id: '',
				name: courseClassroom.classroom.building.name,
			},
		},
	};

	const teacher = courseClassroom.teachingSession.assignmentReport.teacher.user;

	return (
		<div className="flex flex-col max-h-[calc(90vh-6rem)] min-h-0">
			<h1 className="text-xl font-bold mb-5 shrink-0">Editar fila</h1>
			<hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

			<form
				id="form-editar-planificacion"
				onSubmit={formik.handleSubmit}
				className="flex-1 overflow-auto min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4"
			>
				<div>
					<label className="block mb-2 font-bold">No. Empleado</label>
					<input
						value={teacher.code}
						readOnly
						className="cursor-not-allowed w-full bg-gray-100 shadow-md rounded px-2 py-1.5 outline-none"
					/>
				</div>

				<div>
					<label className="block mb-2 font-bold">Nombre</label>
					<input
						value={teacher.name}
						readOnly
						className="cursor-not-allowed w-full bg-gray-100 shadow-md rounded px-2 py-1.5 outline-none"
					/>
				</div>

				<div>
					<label className="block mb-2 font-bold">Código</label>
					<SearchAsyncSelect<TCourseBasicInfo>
						hook={useCoursesSearch}
						handleChange={handleCourseInfo}
						getOptionValue={t => t.id}
						getOptionLabel={t => t.code}
						formatOptionLabel={(data, { context }) =>
							customOptionsReactSelect(data.label, data.data.name, context)
						}
						defaultOption={courseDefaultOption}
					/>
					{formik.touched.courseId && formik.errors.courseId && (
						<Error error={formik.errors.courseId} breakLine={false} />
					)}
				</div>

				<div>
					<label className="block mb-2 font-bold">Asignatura</label>
					<input
						value={formik.values.courseName}
						readOnly
						className="cursor-not-allowed w-full bg-gray-100 shadow-md rounded px-2 py-1.5 outline-none"
					/>
				</div>

				<div>
					<label className="block mb-2 font-bold">Sección</label>
					<select
						name="section"
						value={formik.values.section}
						onChange={handleChange}
						onBlur={formik.handleBlur}
						className="cursor-pointer w-full bg-white border hover:border-gray-400 transition outline-none rounded px-2 py-1.5"
					>
						<option value="">Seleccione una hora</option>
						{generateTimeOptions()}
					</select>
					{formik.touched.section && formik.errors.section && (
						<Error error={formik.errors.section} />
					)}
				</div>

				<div>
					<label className="block mb-2 font-bold">Días</label>
					<select
						name="days"
						value={formik.values.days}
						onChange={handleChange}
						onBlur={formik.handleBlur}
						className="cursor-pointer w-full bg-white border hover:border-gray-400 transition outline-none rounded px-2 py-1.5"
					>
						<option value="" disabled>
							Seleccione...
						</option>
						{DAY_OPTIONS.map(day => (
							<option key={day} value={day}>
								{day}
							</option>
						))}
					</select>
					{formik.touched.days && formik.errors.days && (
						<Error error={formik.errors.days} />
					)}
				</div>

				<div>
					<label className="block mb-2 font-bold">No. Alumnos</label>
					<input
						name="studentCount"
						type="number"
						value={formik.values.studentCount}
						onChange={handleChange}
						onBlur={formik.handleBlur}
						className="cursor-text w-full bg-white border hover:border-gray-400 transition outline-none rounded px-2 py-1.5"
					/>
					{formik.touched.studentCount && formik.errors.studentCount && (
						<Error error={formik.errors.studentCount} />
					)}
				</div>

				<div>
					<label className="block mb-2 font-bold">Aula</label>
					<SearchAsyncSelect<TClassroomSearch>
						hook={useClassroomsSearch}
						handleChange={handleClassroomInfo}
						getOptionValue={t => t.id}
						getOptionLabel={t => t.name}
						formatOptionLabel={(data, { context }) =>
							customOptionsReactSelect(
								data.label,
								data.data.building.name,
								context
							)
						}
						defaultOption={classroomDefaultOption}
					/>
					{formik.touched.classroomId && formik.errors.classroomId && (
						<Error error={formik.errors.classroomId} breakLine={false} />
					)}
				</div>

				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						name="nearGraduation"
						checked={formik.values.nearGraduation}
						onChange={handleChange}
						onBlur={formik.handleBlur}
						className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
					/>
					<span className='cursor-default font-bold'>Sección con estudiantes por egresar</span>
				</div>

				<div className="md:col-span-2">
					<label className="block mb-2 font-bold">Observaciones</label>
					<textarea
						name="observation"
						value={formik.values.observation ?? ''}
						onChange={handleChange}
						onBlur={formik.handleBlur}
						rows={3}
						className="cursor-text w-full bg-white border hover:border-gray-400 transition outline-none rounded px-2 py-1.5"
					/>
					{formik.touched.observation && formik.errors.observation && (
						<Error error={formik.errors.observation} />
					)}
				</div>
			</form>

			<div className="flex justify-end gap-2 mt-2 shrink-0">
				<Button
					type="submit"
					form="form-editar-planificacion"
					disabled={isPending}
					className="w-25 justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition duration-300 cursor-pointer"
					variant="unstyled"
				>
					Guardar
				</Button>
				<Button
					type="button"
					onClick={onCancel}
					disabled={isPending}
					className="w-25 justify-center bg-[#fc4c3f] text-white p-2 hover:bg-red-300 transition duration-300 cursor-pointer"
					variant="unstyled"
				>
					Cancelar
				</Button>
			</div>
		</div>
	);
};
