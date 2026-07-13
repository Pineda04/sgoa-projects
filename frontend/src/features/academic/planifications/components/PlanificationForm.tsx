import { useEffect, useState } from 'react';
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
import { useUser } from '@config/providers';
import { planificationSchema } from '@features/academic/planifications/schemas';
import {
	DAY_OPTIONS,
	generateTimeOptions,
} from '@features/academic/planifications/utils';
import { Button, Error, SearchAsyncSelect } from '@shared/components';
import { useModal } from '@shared/hooks';
import { customOptionsReactSelect, errorsFormik } from '@shared/utils';
import { useFormik } from 'formik';
import { ClassroomAvailabilityModal } from '@features/infrastructure/classrooms/components/ClassroomAvailabilityModal';

interface IPlanificationFormProps {
	centerDepartmentId: string;
	initialData?: TPlanification;
	onCancel: () => void;
	onSubmit: (data: TPlanification) => void;
}

const FIELD_TYPE_TAG = {
	TEXT: 'text',
	NUMBER: 'number',
	SELECT: 'select',
	CUSTOM_SELECT: 'custom-select',
	TIME_SELECT: 'time-select',
	CHECKBOX: 'checkbox',
} as const;

type TField = (typeof FIELD_TYPE_TAG)[keyof typeof FIELD_TYPE_TAG];

interface IFieldTag {
	label: string;
	name: string;
	type: TField;
	readOnly: boolean;
	element?: React.ReactNode;
	checkboxLabel?: string;
}

const numericFields: (keyof TPlanification)[] = ['uv', 'studentCount'];

const useTeachersSearch = (st: string) => useGetTeachersBySearchTerm(st);

const useClassroomsSearch = (st: string, page?: number, size?: number) =>
	useGetClassroomsBySearchTerm(st, page, size);

export const PlanificationForm = ({
	centerDepartmentId,
	initialData,
	onCancel,
	onSubmit,
}: IPlanificationFormProps) => {
	const currentUser = useUser();
	const currentCenter = currentUser.headPositions.find(
		p => p.centerDepartmentId === centerDepartmentId
	);
	const [selectedClassroomId, setSelectedClassroomId] = useState<
		string | null
	>(null);

	const [isAvailOpen, openAvail, closeAvail] = useModal();

	const useCoursesSearch = (st: string) =>
		useGetCoursesCenterDepartmentBySearchTerm(centerDepartmentId, st);

	// Prefetch full objects from the APIs so we can provide a proper defaultOption
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

	useEffect(() => {
		if (classroomInitQuery.data?.data?.length) {
			setSelectedClassroomId(classroomInitQuery.data.data[0].id);
		}
	}, [classroomInitQuery.data]);

	const teacherDefaultOption =
		teacherInitQuery.data?.data && teacherInitQuery.data.data.length
			? {
					value: teacherInitQuery.data.data[0].id,
					label: teacherInitQuery.data.data[0].code,
					data: teacherInitQuery.data.data[0],
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

	const courseDefaultOption =
		courseInitQuery.data?.data && courseInitQuery.data.data.length
			? {
					value: courseInitQuery.data.data[0].id,
					label: courseInitQuery.data.data[0].code,
					data: courseInitQuery.data.data[0],
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

	const classroomDefaultOption =
		classroomInitQuery.data?.data && classroomInitQuery.data.data.length
			? {
					value: classroomInitQuery.data.data[0].id,
					label: classroomInitQuery.data.data[0].name,
					data: classroomInitQuery.data.data[0],
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

	const formik = useFormik<TPlanification>({
		enableReinitialize: true,
		initialValues: initialData ?? {
			teacherCode: '',
			teacherName: '',
			courseCode: '',
			courseName: '',
			uv: 1,
			section: '',
			studentCount: 1,
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
		onSubmit: values => {
			onSubmit(values);
		},
		validateOnChange: true,
	});

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const name = e.target.name as keyof TPlanification;
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

	const handleTeacherInfo = (data: TTeacherBasicInfo) =>
		formik.setValues({
			...formik.values,
			teacherCode: data.code,
			teacherName: data.name,
		});

	const handleCourseInfo = (data: TCourseBasicInfo) =>
		formik.setValues({
			...formik.values,
			courseCode: data.code,
			courseName: data.name,
			uv: data.uvs,
		});

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
				{(
					[
						{
							label: 'No. Empleado',
							name: 'teacherCode',
							type: 'custom-select',
							readOnly: false,
							element: (
								<SearchAsyncSelect<TTeacherBasicInfo>
									hook={useTeachersSearch}
									handleChange={handleTeacherInfo}
									getOptionValue={t => t.id}
									getOptionLabel={t => t.code}
									formatOptionLabel={(data, { context }) => {
										return customOptionsReactSelect(
											data.label,
											data.data.name,
											context
										);
									}}
									defaultOption={finalTeacherDefaultOption}
								/>
							),
						},
						{
							label: 'Nombre',
							name: 'teacherName',
							type: 'text',
							readOnly: true,
						},
						{
							label: 'Código',
							name: 'courseCode',
							type: 'custom-select',
							readOnly: false,
							element: (
								<SearchAsyncSelect<TCourseBasicInfo>
									hook={useCoursesSearch}
									handleChange={handleCourseInfo}
									getOptionValue={t => t.id}
									getOptionLabel={t => t.code}
									formatOptionLabel={(data, { context }) => {
										return customOptionsReactSelect(
											data.label,
											data.data.name,
											context
										);
									}}
									defaultOption={finalCourseDefaultOption}
								/>
							),
						},
						{
							label: 'Asignatura',
							name: 'courseName',
							type: 'text',
							readOnly: true,
						},
						{
							label: 'Estudiantes por egresar',
							name: 'nearGraduation',
							type: 'checkbox',
							readOnly: false,
							checkboxLabel:
								'Sección con Estudiantes por egresar',
						},
						{
							/* FIX: Debe ser hora */
							label: 'Sección',
							name: 'section',
							type: 'time-select',
							readOnly: false,
						},
						{
							label: 'UV',
							name: 'uv',
							type: 'number',
							readOnly: true,
						},
						{
							label: 'Días',
							name: 'days',
							type: 'select',
							readOnly: false,
						},
						{
							label: 'No. Alumnos',
							name: 'studentCount',
							type: 'number',
							readOnly: false,
						},
						{
							label: 'Aula',
							name: 'classroomName',
							type: 'custom-select',
							readOnly: false,
							element: (
								<SearchAsyncSelect<TClassroomSearch>
									hook={useClassroomsSearch}
									handleChange={(data: TClassroomSearch) => {
										setSelectedClassroomId(data.id);
										formik.setValues({
											...formik.values,
											classroomName: data.name,
										});
										return;
									}}
									getOptionValue={t => t.id}
									getOptionLabel={t => t.name}
									formatOptionLabel={(data, { context }) => {
										return customOptionsReactSelect(
											data.label,
											data.data.building.name,
											context
										);
									}}
									defaultOption={finalClassroomDefaultOption}
								/>
							),
						},
						{
							label: 'Carrera / Área',
							name: 'departmentName',
							type: 'text',
							readOnly: true,
						},
						{
							label: 'Jefe / Coordinador',
							name: 'coordinator',
							type: 'text',
							readOnly: true,
						},
						{
							label: 'Centro / Telecentro',
							name: 'center',
							type: 'text',
							readOnly: true,
						},
					] as IFieldTag[]
				).map(
					({
						label,
						name,
						type: fieldType,
						readOnly,
						element,
						checkboxLabel,
					}) => (
						<div key={name}>
							<label className="block mb-2 font-bold">
								{label}
							</label>

							{fieldType === FIELD_TYPE_TAG.SELECT ? (
								<select
									name={name}
									value={
										formik.values[
											name as keyof TPlanification
										] as string
									}
									onChange={handleChange}
									onBlur={formik.handleBlur}
									className="cursor-pointer w-full bg-white border hover:border-gray-400 transition outline-none rounded px-2 py-1.5"
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
							) : fieldType === FIELD_TYPE_TAG.CUSTOM_SELECT ? (
								// Render the provided custom element (SearchAsyncSelect). The select
								// receives `defaultOption` so it will show the code when editing.
								<div className="flex items-center gap-2">
									<div className="flex-1">
										{element ?? null}
									</div>
									{name === 'classroomName' && (
										<button
											type="button"
											onClick={() => {
												if (!selectedClassroomId)
													return;
												openAvail();
											}}
											disabled={!selectedClassroomId}
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
												<line
													x1="16"
													y1="2"
													x2="16"
													y2="6"
												/>
												<line
													x1="8"
													y1="2"
													x2="8"
													y2="6"
												/>
												<line
													x1="3"
													y1="10"
													x2="21"
													y2="10"
												/>
											</svg>
										</button>
									)}
								</div>
							) : fieldType === FIELD_TYPE_TAG.TIME_SELECT ? (
								<select
									name={name}
									value={
										formik.values[
											name as keyof TPlanification
										] as string
									}
									onChange={handleChange}
									onBlur={formik.handleBlur}
									className="cursor-pointer w-full bg-white border hover:border-gray-400 transition outline-none rounded px-2 py-1.5"
								>
									<option value="">
										Seleccione una hora
									</option>
									{generateTimeOptions()}
								</select>
							) : fieldType === FIELD_TYPE_TAG.CHECKBOX ? (
								<div className="flex items-center gap-2">
									<input
										type="checkbox"
										name={name}
										checked={
											formik.values[
												name as keyof TPlanification
											] as boolean
										}
										onChange={handleChange}
										onBlur={formik.handleBlur}
										className="cursor-pointer w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
									/>
									<span className="cursor-default">
										{checkboxLabel}
									</span>
								</div>
							) : (
								<input
									name={name}
									type={fieldType}
									value={
										typeof formik.values[
											name as keyof TPlanification
										] === 'boolean'
											? ''
											: (formik.values[
													name as keyof TPlanification
												] as string | number)
									}
									onChange={handleChange}
									onBlur={formik.handleBlur}
									className={`${readOnly ? 'cursor-not-allowed' : 'cursor-text'} w-full ${readOnly ? 'bg-gray-100 shadow-md' : 'bg-white border hover:border-gray-400 transition'} rounded px-2 py-1.5 outline-none`}
									readOnly={readOnly}
								/>
							)}

							{formik.touched[name as keyof TPlanification] &&
								formik.errors[name as keyof TPlanification] && (
									<Error
										error={
											formik.errors[
												name as keyof TPlanification
											] as string
										}
										breakLine={
											fieldType !==
											FIELD_TYPE_TAG.CUSTOM_SELECT
										}
									/>
								)}
						</div>
					)
				)}

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
						className="cursor-text w-full bg-white border hover:border-gray-400 transition outline-none rounded px-2 py-1.5 resize-none"
					/>
					{formik.touched.observation &&
						formik.errors.observation && (
							<Error
								error={formik.errors.observation as string}
							/>
						)}
				</div>
			</form>

			{selectedClassroomId && (
				<ClassroomAvailabilityModal
					isOpen={isAvailOpen}
					onClose={closeAvail}
					classroomId={selectedClassroomId}
					classroomName={formik.values.classroomName}
				/>
			)}

			<div className="flex justify-end gap-2 mt-2 shrink-0">
				<Button
					type="submit"
					className="w-25 justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 transition duration-300 cursor-pointer"
					form="form-planificacion"
					variant="unstyled"
				>
					Guardar
				</Button>
				<Button
					type="button"
					className="w-25 justify-center bg-[#fc4c3f] text-white p-2 hover:bg-red-300 transition duration-300 cursor-pointer"
					onClick={onCancel}
					variant="unstyled"
				>
					Cancelar
				</Button>
			</div>
		</div>
	);
};
