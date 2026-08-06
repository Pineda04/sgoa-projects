import { useState, type ReactNode } from 'react';
import { TPlanification } from '@api/assignment-reports';
import {
	TClassroomSearch,
	useGetClassroomsBySearchTerm,
} from '@api/classrooms';
import {
	TCourseBasicInfo,
	useGetCoursesCenterDepartmentBySearchTerm,
} from '@api/courses';
import { TTeacherBasicInfo, useGetTeachersBySearchTerm } from '@api/teachers';
import { useGetAcademicPeriodNextToCreate } from '@api/periods';
import { useUser } from '@config/providers';
import { planificationSchema } from '@features/academic/planifications/schemas';
import { DAY_OPTIONS } from '@features/academic/planifications/utils';
import { Button, Error, SearchAsyncSelect } from '@shared/components';
import { useModal } from '@shared/hooks';
import { customOptionsReactSelect, errorsFormik } from '@shared/utils';
import { useFormik } from 'formik';
import { ClassroomAvailabilityModal } from '@features/infrastructure/classrooms/components/ClassroomAvailabilityModal';
import { ScheduleRangeField } from './ScheduleRangeField';
import { FiSave } from 'react-icons/fi';

interface IPlanificationFormProps {
	centerDepartmentId: string;
	initialData?: TPlanification;
	onCancel: () => void;
	onSubmit: (data: TPlanification) => void;
}

interface IFormFieldProps {
	label: string;
	children: ReactNode;
	touched?: boolean;
	error?: string;
	breakErrorLine?: boolean;
	className?: string;
}

const inputClassName =
	'w-full rounded px-2 py-1.5 outline-none bg-white border hover:border-gray-400 transition';
const readOnlyInputClassName =
	'w-full cursor-not-allowed rounded px-2 py-1.5 outline-none bg-gray-100 shadow-md';

const FormField = ({
	label,
	children,
	touched,
	error,
	breakErrorLine = true,
	className,
}: IFormFieldProps) => (
	<div className={className}>
		<label className="block mb-2 font-bold">{label}</label>
		{children}
		{touched && error ? (
			<Error error={error} breakLine={breakErrorLine} />
		) : null}
	</div>
);

const useTeachersSearch = (searchTerm: string) =>
	useGetTeachersBySearchTerm(searchTerm);

const useClassroomsSearch = (
	searchTerm: string,
	page?: number,
	size?: number
) => useGetClassroomsBySearchTerm(searchTerm, page, size);

export const PlanificationForm = ({
	centerDepartmentId,
	initialData,
	onCancel,
	onSubmit,
}: IPlanificationFormProps) => {
	const currentUser = useUser();
	const currentCenter = currentUser.headPositions.find(
		position => position.centerDepartmentId === centerDepartmentId
	);
	const [selectedClassroomId, setSelectedClassroomId] = useState<
		string | null
	>(null);
	const [isAvailOpen, openAvail, closeAvail] = useModal();

	const { data: nextPeriod } = useGetAcademicPeriodNextToCreate();

	const useCoursesSearch = (searchTerm: string) =>
		useGetCoursesCenterDepartmentBySearchTerm(
			centerDepartmentId,
			searchTerm
		);

	const teacherInitQuery = useGetTeachersBySearchTerm(
		initialData?.teacherCode ?? ''
	);
	const courseInitQuery = useGetCoursesCenterDepartmentBySearchTerm(
		centerDepartmentId,
		initialData?.courseCode ?? ''
	);
	const classroomInitQuery = useGetClassroomsBySearchTerm(
		initialData?.classroomName ?? '',
		1,
		50
	);

	const initialTeacher = teacherInitQuery.data?.data[0];
	const teacherDefaultOption = initialTeacher
		? {
				value: initialTeacher.id,
				label: initialTeacher.code,
				data: initialTeacher,
			}
		: null;
	const finalTeacherDefaultOption =
		teacherDefaultOption ??
		(initialData?.teacherCode
			? {
					value: initialData.teacherCode,
					label: initialData.teacherCode,
					data: {
						id: initialData.teacherCode,
						userId: initialData.teacherCode,
						code: initialData.teacherCode,
						name: initialData.teacherName ?? '',
						email: null,
					},
				}
			: null);

	const initialCourse = courseInitQuery.data?.data[0];
	const courseDefaultOption = initialCourse
		? {
				value: initialCourse.id,
				label: initialCourse.code,
				data: initialCourse,
			}
		: null;
	const finalCourseDefaultOption =
		courseDefaultOption ??
		(initialData?.courseCode
			? {
					value: initialData.courseCode,
					label: initialData.courseCode,
					data: {
						id: initialData.courseCode,
						code: initialData.courseCode,
						name: initialData.courseName ?? '',
						uvs: initialData.uv ?? 1,
						activeStatus: true,
						department: {
							id: initialData.departmentName ?? '',
							name: initialData.departmentName ?? '',
						},
					},
				}
			: null);

	const initialClassroom =
		classroomInitQuery.data?.data.find(
			classroom => classroom.name === initialData?.classroomName
		) ?? classroomInitQuery.data?.data[0];
	const classroomDefaultOption = initialClassroom
		? {
				value: initialClassroom.id,
				label: initialClassroom.name,
				data: initialClassroom,
			}
		: null;
	const finalClassroomDefaultOption =
		classroomDefaultOption ??
		(initialData?.classroomName
			? {
					value: initialData.classroomName,
					label: initialData.classroomName,
					data: {
						id: initialData.classroomName,
						name: initialData.classroomName,
						building: {
							id: initialData.center ?? initialData.classroomName,
							name: initialData.center ?? '',
						},
					},
				}
			: null);
	const availableClassroomId = selectedClassroomId ?? initialClassroom?.id ?? null;

	const formik = useFormik<TPlanification>({
		enableReinitialize: true,
		initialValues: initialData ?? {
			teacherCode: '',
			teacherName: '',
			courseCode: '',
			courseName: '',
			uv: 1,
			section: '',
			studentCount: null,
			days: 'LuMaMiJuVi',
			center: currentCenter?.center.name ?? '',
			classroomName: '',
			departmentName: currentCenter?.department.name ?? '',
			coordinator: currentUser.user?.name ?? '',
			nearGraduation: false,
			observation: '',
		},
		validate: values => {
			const result = planificationSchema.safeParse(values);
			if (result.success) return {};
			return errorsFormik<TPlanification>(result);
		},
		onSubmit,
		validateOnChange: true,
	});

	const handleTeacherInfo = (teacher: TTeacherBasicInfo) =>
		formik.setValues({
			...formik.values,
			teacherCode: teacher.code,
			teacherName: teacher.name,
		});

	const handleCourseInfo = (course: TCourseBasicInfo) =>
		formik.setValues({
			...formik.values,
			courseCode: course.code,
			courseName: course.name,
			uv: course.uvs,
		});

	const handleClassroomInfo = (classroom: TClassroomSearch) => {
		setSelectedClassroomId(classroom.id);
		formik.setFieldValue('classroomName', classroom.name);
	};

	const openClassroomAvailability = () => {
		if (availableClassroomId) openAvail();
	};

	return (
		<div className="flex flex-col max-h-[calc(90vh-6rem)] min-h-0">
			<h1 className="text-xl font-bold mb-5 shrink-0">
				{initialData ? 'Editar fila' : 'Nueva fila'}
			</h1>
			<hr className="h-px my-2 bg-gray-200 border-0 shrink-0" />

			<form
				id="form-planificacion"
				onSubmit={formik.handleSubmit}
				className="flex-1 overflow-auto min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4"
			>
				<FormField
					label="No. Empleado"
					touched={formik.touched.teacherCode}
					error={formik.errors.teacherCode}
					breakErrorLine={false}
				>
					<SearchAsyncSelect<TTeacherBasicInfo>
						hook={useTeachersSearch}
						handleChange={handleTeacherInfo}
						getOptionValue={teacher => teacher.id}
						getOptionLabel={teacher => teacher.code}
						formatOptionLabel={(option, { context }) =>
							customOptionsReactSelect(
								option.label,
								option.data.name,
								context
							)
						}
						defaultOption={finalTeacherDefaultOption}
					/>
				</FormField>

				<FormField
					label="Nombre"
					touched={formik.touched.teacherName}
					error={formik.errors.teacherName}
				>
					<input
						name="teacherName"
						type="text"
						value={formik.values.teacherName}
						className={readOnlyInputClassName}
						readOnly
					/>
				</FormField>

				<FormField
					label="Código"
					touched={formik.touched.courseCode}
					error={formik.errors.courseCode}
					breakErrorLine={false}
				>
					<SearchAsyncSelect<TCourseBasicInfo>
						hook={useCoursesSearch}
						handleChange={handleCourseInfo}
						getOptionValue={course => course.id}
						getOptionLabel={course => course.code}
						formatOptionLabel={(option, { context }) =>
							customOptionsReactSelect(
								option.label,
								option.data.name,
								context
							)
						}
						defaultOption={finalCourseDefaultOption}
					/>
				</FormField>

				<FormField
					label="Asignatura"
					touched={formik.touched.courseName}
					error={formik.errors.courseName}
				>
					<input
						name="courseName"
						type="text"
						value={formik.values.courseName}
						className={readOnlyInputClassName}
						readOnly
					/>
				</FormField>

				<FormField
					label="Estudiantes por egresar"
					touched={formik.touched.nearGraduation}
					error={formik.errors.nearGraduation}
				>
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							name="nearGraduation"
							checked={formik.values.nearGraduation}
							onChange={event =>
								formik.setFieldValue(
									'nearGraduation',
									event.target.checked
								)
							}
							onBlur={formik.handleBlur}
							className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
						/>
						<span className="cursor-default">
							Sección con Estudiantes por egresar
						</span>
					</div>
				</FormField>

				<FormField
					label="Sección"
					touched={formik.touched.section}
					error={formik.errors.section}
				>
					<ScheduleRangeField
						value={formik.values.section}
						onChange={value => formik.setFieldValue('section', value)}
						onBlur={() => formik.setFieldTouched('section', true)}
					/>
				</FormField>

				<FormField
					label="UV"
					touched={formik.touched.uv}
					error={formik.errors.uv}
				>
					<input
						name="uv"
						type="number"
						value={formik.values.uv}
						className={readOnlyInputClassName}
						readOnly
					/>
				</FormField>

				<FormField
					label="Días"
					touched={formik.touched.days}
					error={formik.errors.days}
				>
					<select
						name="days"
						value={formik.values.days}
						onChange={event =>
							formik.setFieldValue('days', event.target.value)
						}
						onBlur={formik.handleBlur}
						className={`cursor-pointer ${inputClassName}`}
					>
						<option value="select" disabled>
							Seleccione...
						</option>
						{DAY_OPTIONS.map(day => (
							<option key={day} value={day}>
								{day}
							</option>
						))}
					</select>
				</FormField>

				<FormField
					label="No. Alumnos"
					touched={formik.touched.studentCount}
					error={formik.errors.studentCount}
				>
					<input
						name="studentCount"
						type="number"
						value={formik.values.studentCount ?? ''}
						onChange={event =>
							formik.setFieldValue(
								'studentCount',
								event.target.value === ''
									? null
									: Number(event.target.value)
							)
						}
						onBlur={formik.handleBlur}
						className={`cursor-text ${inputClassName}`}
					/>
				</FormField>

				<FormField
					label="Aula"
					touched={formik.touched.classroomName}
					error={formik.errors.classroomName}
					breakErrorLine={false}
				>
					<div className="flex items-center gap-2">
						<div className="flex-1">
							<SearchAsyncSelect<TClassroomSearch>
								hook={useClassroomsSearch}
								handleChange={handleClassroomInfo}
								getOptionValue={classroom => classroom.id}
								getOptionLabel={classroom => classroom.name}
								formatOptionLabel={(option, { context }) =>
									customOptionsReactSelect(
										option.label,
										option.data.building.name,
										context
									)
								}
								defaultOption={finalClassroomDefaultOption}
							/>
						</div>
						<button
							type="button"
							onClick={openClassroomAvailability}
							disabled={!availableClassroomId}
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
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
								<line x1="16" y1="2" x2="16" y2="6" />
								<line x1="8" y1="2" x2="8" y2="6" />
								<line x1="3" y1="10" x2="21" y2="10" />
							</svg>
						</button>
					</div>
				</FormField>

				<FormField
					label="Carrera / Área"
					touched={formik.touched.departmentName}
					error={formik.errors.departmentName}
				>
					<input
						name="departmentName"
						type="text"
						value={formik.values.departmentName}
						className={readOnlyInputClassName}
						readOnly
					/>
				</FormField>

				<FormField
					label="Jefe / Coordinador"
					touched={formik.touched.coordinator}
					error={formik.errors.coordinator}
				>
					<input
						name="coordinator"
						type="text"
						value={formik.values.coordinator}
						className={readOnlyInputClassName}
						readOnly
					/>
				</FormField>

				<FormField
					label="Centro / Telecentro"
					touched={formik.touched.center}
					error={formik.errors.center}
				>
					<input
						name="center"
						type="text"
						value={formik.values.center}
						className={readOnlyInputClassName}
						readOnly
					/>
				</FormField>

				<FormField
					label="Observaciones"
					touched={formik.touched.observation}
					error={formik.errors.observation}
					className="md:col-span-2"
				>
					<textarea
						name="observation"
						value={formik.values.observation ?? ''}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						rows={3}
						className="cursor-text w-full bg-white border hover:border-gray-400 transition outline-none rounded px-2 py-1.5 resize-none"
					/>
				</FormField>
			</form>

			{availableClassroomId ? (
				<ClassroomAvailabilityModal
					isOpen={isAvailOpen}
					onClose={closeAvail}
					classroomId={availableClassroomId}
					classroomName={formik.values.classroomName}
					defaultPeriodId={nextPeriod?.id}
				/>
			) : null}

			<div className="flex justify-end gap-2 mt-2 shrink-0">
				<Button
					type="button"
					onClick={onCancel}
					variant="outline"
				>
					Cancelar
				</Button>
				<Button
					type="submit"
					className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
					form="form-planificacion"
				>
					<FiSave className="size-4" />
					<span>Guardar Asignación</span>
				</Button>
			</div>
		</div>
	);
};
