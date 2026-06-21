import { useState } from 'react';
import {
	PlusCircleIcon,
	XCircleIcon,
	DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { IPlanification } from '@api/assignment-reports';
import { Button } from '@shared/components';

// TODO: Falta la logica del backend
export const EditPlanification = () => {
	//set para filas de tabla
	const [planificationRows, setPlanificationRows] = useState<
		IPlanification[]
	>([]);

	//Funciones para agregar y quitar filas
	const addRowPlanification = (
		rows: IPlanification[],
		setRows: React.Dispatch<React.SetStateAction<IPlanification[]>>
	) => {
		setRows([
			...rows]);
	};

	const removeRowPlanification = (
		rows: IPlanification[],
		setRows: React.Dispatch<React.SetStateAction<IPlanification[]>>
	) => {
		if (rows.length > 1) setRows(rows.slice(0, -1));
	};

	return (
		<>
			{/* Titulos */}
			<div className="mt-10 flex flex-col items-center">
				<label className="text-2xl font-semibold">
					UNAH CAMPUS-COPÁN
				</label>
				<label>Asignación Académica Presencial</label>
			</div>

			<form className="mb-20">
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
						<Button
							type="button"
							onClick={() =>
								addRowPlanification(
									planificationRows,
									setPlanificationRows
								)
							}
							className="w-37.5 justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 rounded-xl transition flex flex-row gap-2 duration-500"
							variant="unstyled"
						>
							<PlusCircleIcon className="size-6" />
							Agregar fila
						</Button>
						<Button
							type="button"
							onClick={() =>
								removeRowPlanification(
									planificationRows,
									setPlanificationRows
								)
							}
							className="w-37.5 justify-center bg-[#DC3545] text-white p-2 hover:bg-red-300 rounded-xl transition flex flex-row gap-2 duration-500"
							variant="unstyled"
						>
							<XCircleIcon className="size-6" />
							Quitar fila
						</Button>
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
								{planificationRows.map((_, index) => (
									<tr key={index}>
										<td className="py-fit border">
											{/*# de fila*/}
											<input
												name="numeroFila"
												readOnly
												value={index + 1}
												className="rounded-md w-12 text-center"
											/>
										</td>
										<td className="py-fit border">
											{/*No Empleado*/}
											<input
												name="numeroEmpleado"
												type="number"
												className="ps-1 w-16 py-1 text-center"
											/>
										</td>
										<td className="py-fit border">
											{/*Nombre Empleado*/}
											<input
												name="nombreEmpleado"
												type="text"
												className="ps-1 py-1 text-center"
											/>
										</td>
										<td className="py-fit border">
											{/*Codigo*/}
											<input
												name="codigo"
												type="number"
												className="ps-1 w-12 py-1 text-center"
											/>
										</td>
										<td className="py-fit border">
											{/*Asignatura*/}
											<input
												name="asignatura"
												type="text"
												className="ps-1 py-1 text-center"
											/>
										</td>
										<td className="py-fit border">
											{/*#Seccion*/}
											<input
												name="seccion"
												type="text"
												className="ps-1 w-12 py-1 text-center"
											/>
										</td>
										<td className="py-fit border">
											{/*UV*/}
											<input
												name="uv"
												type="number"
												className="ps-1 w-12 py-1 text-center"
											/>
										</td>
										<td className="py-fit border">
											{/*Dias*/}
											<select
												name="diasClase"
												className="w-full py-1 text-sm"
											>
												<option value="">
													Seleccione...
												</option>
												<option value="OpcionA">
													LuMaMiJuVi
												</option>
												<option value="OpcionB">
													LuMaMiJu
												</option>
												<option value="OpcionC">
													LuMaMi
												</option>
												<option value="OpcionC">
													LuMa
												</option>
												<option value="OpcionC">
													Lu
												</option>
											</select>
										</td>
										<td className="py-fit border">
											{/*Numero de alumnos*/}
											<input
												name="numAlumnos"
												type="number"
												className="ps-1 w-25 py-1 text-center"
											/>
										</td>
										<td className="py-fit border">
											{/*Numero de aula*/}
											<input
												name="numAula"
												type="number"
												className="ps-1 w-20 py-1 text-center"
											/>
										</td>
										<td className="py-fit border">
											{/*Carrera o area*/}
											<select
												name="carreraArea"
												className="w-full py-1 text-sm"
											>
												<option value="">
													Seleccione...
												</option>
												<option value="OpcionA">
													Sacar de la DB
												</option>
											</select>
										</td>
										<td className="py-fit border">
											{/*Jefe\Coordinador*/}
											<input
												readOnly
												name="jefeCoordinador"
												type="text"
												className="ps-1 py-1 text-center"
												value={'Sacar de la DB'}
											/>
										</td>
										<td className="py-fit border">
											{/*Centro\telecentro*/}
											<select
												name="centroTelecentro"
												className="w-full py-1 text-sm"
											>
												<option value="">
													Seleccione...
												</option>
												<option value="OpcionA">
													Sacar de la DB
												</option>
											</select>
										</td>
										<td className="py-fit border">
											{/*Observaciones*/}
											<textarea
												name="observaciones"
												className="ps-1 resize-none overflow-hidden w-50"
												onInput={e => {
													const target =
														e.currentTarget;
													target.style.height =
														'auto'; // reset height
													target.style.height =
														target.scrollHeight +
														'px'; // set new height
												}}
											/>
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
		</>
	);
};
