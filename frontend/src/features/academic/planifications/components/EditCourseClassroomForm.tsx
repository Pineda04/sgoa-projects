import { useFormik } from 'formik';
import { AxiosError } from 'axios';
import {
	TCourseBasicInfo,
	TEditCourseClassroom,
	useGetCourseClassroomById,
	useGetCoursesCenterDepartmentBySearchTerm,
	useUpdateCourseClassroom,
} from '@api/courses';
import {
	TClassroomSearch,
	useGetClassroomsBySearchTerm,
} from '@api/classrooms';
import { editCourseClassroomSchema } from '../schemas';
import { DAY_OPTIONS } from '../utils';
import { ScheduleRangeField } from './ScheduleRangeField';
import {
	Button,
	Error,
	Loading,
	SearchAsyncSelect,
	TagError,
} from '@shared/components';
import { useModal } from '@shared/hooks';
import {
	ESwalIcons,
	customOptionsReactSelect,
	errorsFormik,
	genericAlert,
} from '@shared/utils';
import { ClassroomAvailabilityModal } from '@features/infrastructure/classrooms/components/ClassroomAvailabilityModal';
import { FiSave } from 'react-icons/fi';

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

	const [isAvailOpen, openAvail, closeAvail] = useModal();

	const centerDepartmentId =
		courseClassroom?.teachingSession.assignmentReport.centerDepartmentId ??
		'';

	const useCoursesSearch = (searchTerm: string) =>
		useGetCoursesCenterDepartmentBySearchTerm(
			centerDepartmentId,
			searchTerm
		);

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
			studentCount: courseClassroom?.studentCount ?? null,
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
		let value: string | number | boolean | null;

		if (e.target.type === 'checkbox') {
			value = (e.target as HTMLInputElement).checked;
		} else if (numericFields.includes(name)) {
			const raw = e.target.value;
			value = raw === '' ? null : Number(raw);
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

	const teacher =
		courseClassroom.teachingSession.assignmentReport.teacher.user;

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
							customOptionsReactSelect(
								data.label,
								data.data.name,
								context
							)
						}
						defaultOption={courseDefaultOption}
					/>
					{formik.touched.courseId && formik.errors.courseId && (
						<Error
							error={formik.errors.courseId}
							breakLine={false}
						/>
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
					<ScheduleRangeField
						value={formik.values.section}
						onChange={value =>
							formik.setFieldValue('section', value)
						}
						onBlur={() => formik.setFieldTouched('section', true)}
					/>
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
						value={formik.values.studentCount ?? ''}
						onChange={handleChange}
						onBlur={formik.handleBlur}
						className="cursor-text w-full bg-white border hover:border-gray-400 transition outline-none rounded px-2 py-1.5"
					/>
					{formik.touched.studentCount &&
						formik.errors.studentCount && (
							<Error error={formik.errors.studentCount} />
						)}
				</div>

				<div>
					<label className="block mb-2 font-bold">Aula</label>
					<div className="flex items-center gap-2">
						<div className="flex-1">
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
						</div>
						<button
							type="button"
							onClick={openAvail}
							disabled={!formik.values.classroomId}
							className="size-10 inline-flex items-center justify-center p-1.5 text-yellow-700 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 rounded-sm transition-all duration-200 cursor-pointer shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
							title="Ver disponibilidad"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="size-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<rect
									x="3"
									y="4"
									width="18"
									height="18"
									rx="2"
									ry="2"
								/>
								<line x1="16" y1="2" x2="16" y2="6" />
								<line x1="8" y1="2" x2="8" y2="6" />
								<line x1="3" y1="10" x2="21" y2="10" />
							</svg>
						</button>
					</div>
					{formik.touched.classroomId &&
						formik.errors.classroomId && (
							<Error
								error={formik.errors.classroomId}
								breakLine={false}
							/>
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
					<span className="cursor-default font-bold">
						Sección con estudiantes por egresar
					</span>
				</div>

				<div className="md:col-span-2">
					<label className="block mb-2 font-bold">
						Observaciones
					</label>
					<textarea
						name="observation"
						value={formik.values.observation ?? ''}
						onChange={handleChange}
						onBlur={formik.handleBlur}
						rows={3}
						className="cursor-text w-full bg-white border hover:border-gray-400 transition outline-none rounded px-2 py-1.5"
					/>
					{formik.touched.observation &&
						formik.errors.observation && (
							<Error error={formik.errors.observation} />
						)}
				</div>
			</form>

			{formik.values.classroomId && (
				<ClassroomAvailabilityModal
					isOpen={isAvailOpen}
					onClose={closeAvail}
					classroomId={formik.values.classroomId}
					classroomName={formik.values.classroomName}
					defaultPeriodId={
						courseClassroom.teachingSession.assignmentReport
							.periodId
					}
				/>
			)}

			<div className="flex justify-end gap-2 mt-2 shrink-0">
				<Button
					type="button"
					onClick={onCancel}
					disabled={isPending}
					variant="outline"
				>
					Cancelar
				</Button>
				<Button
					type="submit"
					form="form-editar-planificacion"
					disabled={isPending}
					className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
				>
					<FiSave className="size-4" />
					<span>Actualizar Asignación</span>
				</Button>
			</div>
		</div>
	);
};
