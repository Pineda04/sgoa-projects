import { Button } from '@components/ui/button';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import {
	PlusCircleIcon,
	XCircleIcon,
	DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { TPlanification, planificationSchema } from '../schemas/planification.schemas';
import { errorsFormik } from '@utils';
import z from 'zod';

// TODO: Falta la logica del backend
const planificationArraySchema = z.object({
	planificationRows: z.array(planificationSchema),
});

type TPlanificationArray = z.infer<typeof planificationArraySchema>;

export const EditPlanification = () => {
	const initialRow: TPlanification = {
		teacherCode: '',
		teacherName: '',
		courseCode: '',
		courseName: '',
		uv: 0,
		section: '',
		studentCount: 0,
		days: '',
		center: '',
		classroomName: '',
		departmentName: '',
		coordinator: '',
		nearGraduation: false,
		observation: '',
	};

	const formik = useFormik<TPlanificationArray>({
		initialValues: {
			planificationRows: [initialRow],
		},
		validate: (values) => {
			const result = planificationArraySchema.safeParse(values);
			if (result.success) return {};
			return errorsFormik<TPlanificationArray>(result);
		},
		onSubmit: (values) => {
			console.log('Datos guardados:', values.planificationRows);
			// Aquí irá la lógica para enviar al backend
		},
		validateOnChange: true,
	});

	const handleRowChange = (
		index: number,
		field: keyof TPlanification,
		value: string | number | boolean
	) => {
		const updatedRows = [...formik.values.planificationRows];
		updatedRows[index] = {
			...updatedRows[index],
			[field]: value,
		};
		formik.setFieldValue('planificationRows', updatedRows);
	};

	const getFieldError = (index: number, field: keyof TPlanification): string | undefined => {
		return (formik.errors.planificationRows as Array<Record<string, string | undefined>> | undefined)?.[index]?.[field];
	};

	const getInputClass = (index: number, field: keyof TPlanification): string => {
		const baseClass = 'ps-1 py-1 text-center rounded-md border';
		const hasError = getFieldError(index, field);
		return hasError ? `${baseClass} border-red-500 bg-red-50` : `${baseClass} border-gray-300`;
	};

	return (
		<FormikProvider value={formik}>
			{/* Titulos */}
			<div className="mt-10 flex flex-col items-center">
				<label className="text-2xl font-semibold">
					UNAH CAMPUS-COPÁN
				</label>
				<label>Asignación Académica Presencial</label>
			</div>

			<form onSubmit={formik.handleSubmit} className="mb-20">
				{/*Datos de la planificacion, Botones Agregar quitar filas*/}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16 w-[85%] mx-auto my-10">
					<div className="flex flex-col">
						{' '}
						{/*Jornada laboral, Falta aplicar funcionalidades*/}
						<label className="mb-1 text-sm font-medium">
							Periodo Académico
						</label>
						<select
							name="periodoSelect"
							className="bg-gray-100 shadow-md rounded-lg px-1 py-1.5 text-sm"
						>
							<option value="">Seleccione...</option>
							<option value="OpcionA">I PAC</option>
							<option value="OpcionB">II PAC</option>
							<option value="OpcionC">III PAC</option>
						</select>
					</div>
					<div className="flex flex-col">
						{' '}
						{/*Fechas que abarca el periodo*/}
						<label className="mb-1 text-sm font-medium">
							Inicio y final del periodo academico
						</label>
						<div className="flex gap-6">
							<input
								type="date"
								name="fechaInicio"
								className="bg-gray-100 shadow-md rounded-lg px-1 py-1 w-fit"
							/>
							<input
								type="date"
								name="fechaFinal"
								className="bg-gray-100 shadow-md rounded-lg px-1 py-1 w-fit"
							/>
						</div>
					</div>
					<div className="flex flex-row gap-10 my-auto">
						<FieldArray name="planificationRows">
							{(fieldArrayHelpers) => (
								<>
									<Button
										type="button"
										onClick={() =>
											fieldArrayHelpers.push(initialRow)
										}
										className="w-[150px] justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 rounded-xl transition flex flex-row gap-2 duration-500"
										variant="unstyled"
									>
										<PlusCircleIcon className="size-6" />
										Agregar fila
									</Button>
									<Button
										type="button"
										onClick={() => {
											if (formik.values.planificationRows.length > 1) {
												fieldArrayHelpers.pop();
											}
										}}
										className="w-[150px] justify-center bg-[#DC3545] text-white p-2 hover:bg-red-300 rounded-xl transition flex flex-row gap-2 duration-500"
										variant="unstyled"
									>
										<XCircleIcon className="size-6" />
										Quitar fila
									</Button>
								</>
							)}
						</FieldArray>
					</div>
				</div>

				{/* Tabla de formulario */}
				<div className="w-full overflow-x-auto py-2 text-sm">
					<div className="overflow-hidden rounded-md shadow-md w-max mx-auto">
						<table className="w-full">
							<thead className="bg-[#144C74] text-white">
								<tr>
									<th className="py-2 px-4">#</th>
									<th className="py-2 px-4">No.Emp</th>
									<th className="py-2 px-4">Nombre</th>
									<th className="py-2 px-4">Código</th>
									<th className="py-2 px-4">Asignatura</th>
									<th className="py-2 px-4">Sección</th>
									<th className="py-2 px-4">UV</th>
									<th className="py-2 px-4">Días</th>
									<th className="py-2 px-4">No. Alumnos</th>
									<th className="py-2 px-4">N° de Aula</th>
									<th className="py-2 px-4">
										Carrera o Área
									</th>
									<th className="py-2 px-4">
										Jefe / Coordinador
									</th>
									<th className="py-2 px-4">
										Centro / Telecentro
									</th>
									<th className="py-2 px-4">Observaciones</th>
								</tr>
							</thead>
							<tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-100 text-center">
								{formik.values.planificationRows.map((row, index) => (
									<tr key={index}>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.row`}
												readOnly
												value={index + 1}
												className="rounded-md w-12 text-center"
											/>
										</td>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.teacherCode`}
												type="text"
												value={row.teacherCode}
												onChange={(e) =>
													handleRowChange(
														index,
														'teacherCode',
														e.target.value
													)
												}
												className={getInputClass(
													index,
													'teacherCode'
												)}
											/>
											{getFieldError(index, 'teacherCode') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'teacherCode')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.teacherName`}
												type="text"
												value={row.teacherName}
												onChange={(e) =>
													handleRowChange(
														index,
														'teacherName',
														e.target.value
													)
												}
												className={getInputClass(
													index,
													'teacherName'
												)}
											/>
											{getFieldError(index, 'teacherName') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'teacherName')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.courseCode`}
												type="text"
												value={row.courseCode}
												onChange={(e) =>
													handleRowChange(
														index,
														'courseCode',
														e.target.value
													)
												}
												className={getInputClass(
													index,
													'courseCode'
												)}
											/>
											{getFieldError(index, 'courseCode') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'courseCode')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.courseName`}
												type="text"
												value={row.courseName}
												onChange={(e) =>
													handleRowChange(
														index,
														'courseName',
														e.target.value
													)
												}
												className={getInputClass(
													index,
													'courseName'
												)}
											/>
											{getFieldError(index, 'courseName') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'courseName')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.section`}
												type="text"
												value={row.section}
												onChange={(e) =>
													handleRowChange(
														index,
														'section',
														e.target.value
													)
												}
												className={getInputClass(
													index,
													'section'
												)}
											/>
											{getFieldError(index, 'section') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'section')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.uv`}
												type="number"
												value={row.uv}
												onChange={(e) =>
													handleRowChange(
														index,
														'uv',
														Number(e.target.value)
													)
												}
												className={getInputClass(
													index,
													'uv'
												)}
											/>
											{getFieldError(index, 'uv') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'uv')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<select
												name={`planificationRows.${index}.days`}
												value={row.days}
												onChange={(e) =>
													handleRowChange(
														index,
														'days',
														e.target.value
													)
												}
												className={
													getFieldError(index, 'days')
														? 'w-full py-1 text-sm border border-red-500 bg-red-50 rounded-md'
														: 'w-full py-1 text-sm border border-gray-300 rounded-md'
												}
											>
												<option value="">
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
												<option value="LuMaMi">
													LuMaMi
												</option>
												<option value="LuMaJu">
													LuMaJu
												</option>
												<option value="LuMaVi">
													LuMaVi
												</option>
												<option value="LuMiJu">
													LuMiJu
												</option>
												<option value="LuMiVi">
													LuMiVi
												</option>
												<option value="LuJuVi">
													LuJuVi
												</option>
												<option value="MaMiJu">
													MaMiJu
												</option>
												<option value="MaMiVi">
													MaMiVi
												</option>
												<option value="MaJuVi">
													MaJuVi
												</option>
												<option value="MiJuVi">
													MiJuVi
												</option>
												<option value="LuMaMiJu">
													LuMaMiJu
												</option>
												<option value="LuMaMiVi">
													LuMaMiVi
												</option>
												<option value="LuMaJuVi">
													LuMaJuVi
												</option>
												<option value="LuMiJuVi">
													LuMiJuVi
												</option>
												<option value="MaMiJuVi">
													MaMiJuVi
												</option>
												<option value="LuMaMiJuVi">
													LuMaMiJuVi
												</option>
											</select>
											{getFieldError(index, 'days') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'days')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.studentCount`}
												type="number"
												value={row.studentCount}
												onChange={(e) =>
													handleRowChange(
														index,
														'studentCount',
														Number(e.target.value)
													)
												}
												className={getInputClass(
													index,
													'studentCount'
												)}
											/>
											{getFieldError(index, 'studentCount') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'studentCount')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.classroomName`}
												type="text"
												value={row.classroomName}
												onChange={(e) =>
													handleRowChange(
														index,
														'classroomName',
														e.target.value
													)
												}
												className={getInputClass(
													index,
													'classroomName'
												)}
											/>
											{getFieldError(index, 'classroomName') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'classroomName')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.departmentName`}
												type="text"
												value={row.departmentName}
												onChange={(e) =>
													handleRowChange(
														index,
														'departmentName',
														e.target.value
													)
												}
												className={getInputClass(
													index,
													'departmentName'
												)}
											/>
											{getFieldError(index, 'departmentName') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'departmentName')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.coordinator`}
												type="text"
												value={row.coordinator}
												onChange={(e) =>
													handleRowChange(
														index,
														'coordinator',
														e.target.value
													)
												}
												className={getInputClass(
													index,
													'coordinator'
												)}
											/>
											{getFieldError(index, 'coordinator') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'coordinator')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<input
												name={`planificationRows.${index}.center`}
												type="text"
												value={row.center}
												onChange={(e) =>
													handleRowChange(
														index,
														'center',
														e.target.value
													)
												}
												className={getInputClass(
													index,
													'center'
												)}
											/>
											{getFieldError(index, 'center') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'center')}
												</div>
											)}
										</td>
										<td className="py-fit border">
											<textarea
												name={`planificationRows.${index}.observation`}
												value={row.observation || ''}
												onChange={(e) =>
													handleRowChange(
														index,
														'observation',
														e.target.value
													)
												}
												className={`ps-1 resize-none overflow-hidden w-50 ${
													getFieldError(index, 'observation')
														? 'border-red-500 bg-red-50'
														: 'border-gray-300'
												}`}
												onInput={(e) => {
													const target =
														e.currentTarget;
													target.style.height =
														'auto';
													target.style.height =
														target.scrollHeight +
														'px';
												}}
											/>
											{getFieldError(index, 'observation') && (
												<div className="text-red-500 text-xs mt-1">
													{getFieldError(index, 'observation')}
												</div>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<Button
					type="submit"
					className="mx-auto w-fit justify-center mt-10 mb-50
        bg-[#C40C54] text-white p-2 hover:bg-pink-500
        rounded-xl transition flex flex-row gap-2 duration-500"
					variant="unstyled"
				>
					<DocumentCheckIcon className="size-6" />
					Guardar planificación
				</Button>
				{/*Fin del formulario*/}
			</form>
		</FormikProvider>
	);
};
