import { TPlanification } from '@api/assignment-reports';
import { TClassroom, useGetClassroomsBySearchTerm } from '@api/classrooms';
import { TCourseBasicInfo, useGetCoursesCenterDepartmentBySearchTerm } from '@api/courses';
import { TTeacherBasicInfo, useGetTeachersBySearchTerm } from '@api/teachers';
import { useUser } from '@config/providers';
import { planificationSchema } from '@features/academic/planifications/schemas';
import { Button, Error, SearchAsyncSelect } from '@shared/components';
import { customOptionsReactSelect, errorsFormik } from '@shared/utils';
import { useFormik } from 'formik';

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

const generateTimeOptions = () => {
	const options = [];

	for (let hour = 6; hour <= 20; hour++) {
		let hour12 = hour % 12;
		if (hour12 === 0) hour12 = 12;

		const period = hour < 12 ? 'AM' : 'PM';
		const timeString = `${hour12}:00 ${period}`;

		options.push(
			<option key={hour} value={timeString}>
				{timeString}
			</option>
		);
	}

	return options;
};

const numericFields: (keyof TPlanification)[] = ['uv', 'studentCount'];

const useTeachersSearch = (st: string) =>
	useGetTeachersBySearchTerm(st);

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

	const useCoursesSearch = (st: string) =>
		useGetCoursesCenterDepartmentBySearchTerm(centerDepartmentId, st);

	const formik = useFormik<TPlanification>({
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
		<>
			<h1 className="text-xl font-bold mb-5">
				{initialData ? 'Editar fila' : 'Nueva fila'}
			</h1>
			<hr className="h-px my-2 bg-gray-200 border-0" />

			<form
				id="form-planificacion"
				onSubmit={formik.handleSubmit}
				className="h-[70vh] overflow-auto grid grid-cols-1 md:grid-cols-2 gap-4"
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
								<SearchAsyncSelect<TClassroom>
									hook={useClassroomsSearch}
									handleChange={(data: TClassroom) => {
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
						type,
						readOnly,
						element,
						checkboxLabel,
					}) => (
						<div key={name}>
							<label className="block mb-2 font-bold">
								{label}
							</label>

							{type === FIELD_TYPE_TAG.SELECT ? (
								<select
									name={name}
									value={
										formik.values[
											name as keyof TPlanification
										] as string
									}
									onChange={handleChange}
									onBlur={formik.handleBlur}
									className="w-full bg-gray-100 shadow-md rounded px-2 py-2 outline-none"
								>
									<option value="select" disabled>
										Seleccione...
									</option>
									<option value="Lu">Lu</option>
									<option value="Ma">Ma</option>
									<option value="Mi">Mi</option>
									<option value="Ju">Ju</option>
									<option value="Vi">Vi</option>
									<option value="LuMa">LuMa</option>
									<option value="LuMi">LuMi</option>
									<option value="LuJu">LuJu</option>
									<option value="LuVi">LuVi</option>
									<option value="MaMi">MaMi</option>
									<option value="MaJu">MaJu</option>
									<option value="MaVi">MaVi</option>
									<option value="MiJu">MiJu</option>
									<option value="MiVi">MiVi</option>
									<option value="JuVi">JuVi</option>
									<option value="LuMaMi">LuMaMi</option>
									<option value="LuMaJu">LuMaJu</option>
									<option value="LuMaVi">LuMaVi</option>
									<option value="LuMiJu">LuMiJu</option>
									<option value="LuMiVi">LuMiVi</option>
									<option value="LuJuVi">LuJuVi</option>
									<option value="MaMiJu">MaMiJu</option>
									<option value="MaMiVi">MaMiVi</option>
									<option value="MaJuVi">MaJuVi</option>
									<option value="MiJuVi">MiJuVi</option>
									<option value="LuMaMiJu">LuMaMiJu</option>
									<option value="LuMaMiVi">LuMaMiVi</option>
									<option value="LuMaJuVi">LuMaJuVi</option>
									<option value="LuMiJuVi">LuMiJuVi</option>
									<option value="MaMiJuVi">MaMiJuVi</option>
									<option value="LuMaMiJuVi">
										LuMaMiJuVi
									</option>
								</select>
							) : type === FIELD_TYPE_TAG.CUSTOM_SELECT ? (
								element && element
							) : type === FIELD_TYPE_TAG.TIME_SELECT ? (
								<select
									name={name}
									value={
										formik.values[
											name as keyof TPlanification
										] as string
									}
									onChange={handleChange}
									onBlur={formik.handleBlur}
									className="w-full bg-gray-100 shadow-md rounded px-2 py-2 outline-none"
								>
									<option value="">
										Seleccione una hora
									</option>
									{generateTimeOptions()}
								</select>
							) : type === FIELD_TYPE_TAG.CHECKBOX ? (
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
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
									/>
									<span>{checkboxLabel}</span>
								</div>
							) : (
								<input
									name={name}
									type={type}
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
									className="w-full bg-gray-100 shadow-md rounded px-2 py-2 outline-none"
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
						className="w-full bg-gray-100 shadow-md rounded px-2 py-2 outline-none resize-none"
					/>
					{formik.touched.observation &&
						formik.errors.observation && (
							<Error
								error={formik.errors.observation as string}
							/>
						)}
				</div>

				<div className="md:col-span-2 flex justify-end gap-2 mt-2">
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
			</form>
		</>
	);
};
