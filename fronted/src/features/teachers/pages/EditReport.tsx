// // import axios from "axios";
// // import { useParams, useNavigate } from "react-router-dom";
// import { useState } from 'react';
// import {
// 	PlusCircleIcon,
// 	MinusCircleIcon,
// 	DocumentArrowUpIcon,
// } from '@heroicons/react/24/outline';
// import { IAcademicPositionSelected, ImagenesUpload } from '../components';
//
// //Valores para crear filas en Tabla Investigacion, Vinculacion
// interface ActVinRow {
// 	nombre: string;
// 	registrado: boolean | null;
// 	expediente: string;
// 	avance: string;
// 	verificacion: string;
// }
//
// //Valores para crear filas en Tabla Diseño Curricular, Otras actividades
// interface InnDisOtrRow {
// 	nombre: string;
// 	avance: string;
// 	verificacion: string;
// }
//
// export const EditReport = () => {
// 	//Estados para las tablas
// 	//Investigacion y vinculacion
// 	const [investigacionRows, setInvestigacionRows] = useState<ActVinRow[]>([
// 		{
// 			nombre: '',
// 			registrado: null,
// 			expediente: '',
// 			avance: '',
// 			verificacion: '',
// 		},
// 	]);
//
// 	const [vinculacionRows, setVinculacionRows] = useState<ActVinRow[]>([
// 		{
// 			nombre: '',
// 			registrado: null,
// 			expediente: '',
// 			avance: '',
// 			verificacion: '',
// 		},
// 	]);
//
// 	//Innovacion, Diseno Curricular y otras actividades
// 	const [innRows, setInnRows] = useState<InnDisOtrRow[]>([
// 		{ nombre: '', avance: '', verificacion: '' },
// 	]);
//
// 	const [disCurRows, setDisCurRows] = useState<InnDisOtrRow[]>([
// 		{ nombre: '', avance: '', verificacion: '' },
// 	]);
//
// 	const [otrasActRows, setOtrasActRows] = useState<InnDisOtrRow[]>([
// 		{ nombre: '', avance: '', verificacion: '' },
// 	]);
//
// 	//Funciones para agregar y quitar filas Investigacion, Vinculacion
// 	const addRowActVin = (
// 		rows: ActVinRow[],
// 		setRows: React.Dispatch<React.SetStateAction<ActVinRow[]>>
// 	) => {
// 		setRows([
// 			...rows,
// 			{
// 				nombre: '',
// 				registrado: null,
// 				expediente: '',
// 				avance: '',
// 				verificacion: '',
// 			},
// 		]);
// 	};
//
// 	const removeRowActVin = (
// 		rows: ActVinRow[],
// 		setRows: React.Dispatch<React.SetStateAction<ActVinRow[]>>
// 	) => {
// 		if (rows.length > 1) setRows(rows.slice(0, -1));
// 	};
//
// 	//Funciones para agregar y quitar filas Innovacion, Diseno Curricular y otras actividades
// 	const addRowInnDisOtr = (
// 		rows: InnDisOtrRow[],
// 		setRows: React.Dispatch<React.SetStateAction<InnDisOtrRow[]>>
// 	) => {
// 		setRows([...rows, { nombre: '', avance: '', verificacion: '' }]);
// 	};
//
// 	const removeRowInnDisOtr = (
// 		rows: InnDisOtrRow[],
// 		setRows: React.Dispatch<React.SetStateAction<InnDisOtrRow[]>>
// 	) => {
// 		if (rows.length > 1) setRows(rows.slice(0, -1));
// 	};
//
// 	//Manejar los cargos del docente
// 	const [cargos, setCargos] = useState<IAcademicPositionSelected>({
// 		director: false,
// 		secretarioAcademico: false,
// 		jefeDepartamento: false,
// 		coordinadorGrado: false,
// 		coordinadorPosgrado: false,
// 		coordinadorAsignatura: false,
// 		coordinadorInvestigacion: false,
// 		coordinadorVinculacion: false,
// 		coordinadorCurricular: false,
// 		miembroConsejo: false,
// 		ninguno: false,
// 		otro: '',
// 	});
//
// 	//Handle Submit, Falta revisar esto cuando el backend este listo
// 	// const handleSubmit = (e: React.FormEvent) => {
// 	//   e.preventDefault();
// 	//   console.log('Datos enviados:', cargos);
// 	// };
//
// 	return (
// 		<>
// 			{/* <Navbar/> */}
// 			{/*Formulario*/}
// 			<form className="my-20">
// 				{/* Inicio del formulario*/}
// 				<h1 className="text-center text-2xl font-bold mb-10">
// 					Informe de actividades académicas "Periodo"
// 				</h1>
// 				<h2 className="text-center mb-5 text-lg font-bold">
// 					Información del docente
// 				</h2>
//
// 				{/* Contenedor de datos del docente */}
// 				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-16 w-[85%] mx-auto">
// 					<div className="flex flex-col">
// 						{' '}
// 						{/*Centro Universitario*/}
// 						<label className="mb-1 text-sm font-medium">
// 							Centro universitario
// 						</label>
// 						<input
// 							readOnly
// 							type="text"
// 							name="centroUniversitario"
// 							placeholder="Centro Universitario"
// 							className="bg-gray-100 shadow-md rounded-lg px-1 py-1"
// 						/>
// 					</div>
// 					<div className="flex flex-col">
// 						{' '}
// 						{/*Facultad*/}
// 						<label className="mb-1 text-sm font-medium">
// 							Facultad
// 						</label>
// 						<input
// 							readOnly
// 							type="text"
// 							name="facultad"
// 							placeholder="Facultad"
// 							className="bg-gray-100 shadow-md rounded-lg px-1 py-1"
// 						/>
// 					</div>
// 					<div className="flex flex-col">
// 						{' '}
// 						{/*Periodo academico*/}
// 						<label className="mb-1 text-sm font-medium">
// 							Periodo académico
// 						</label>
// 						<input
// 							readOnly
// 							type="text"
// 							name="periodoAcademico"
// 							placeholder="Periodo académico"
// 							className="bg-gray-100 shadow-md rounded-lg px-1 py-1"
// 						/>
// 					</div>
// 					<div className="flex flex-col">
// 						{' '}
// 						{/*Departamento*/}
// 						<label className="mb-1 text-sm font-medium">
// 							Departamento
// 						</label>
// 						<input
// 							readOnly
// 							type="text"
// 							name="departamento"
// 							placeholder="Departamento"
// 							className="bg-gray-100 shadow-md rounded-lg px-1 py-1"
// 						/>
// 					</div>
// 					<div className="flex flex-col">
// 						{' '}
// 						{/*Nombre del docente*/}
// 						<label className="mb-1 text-sm font-medium">
// 							Nombre del docente
// 						</label>
// 						<input
// 							readOnly
// 							type="text"
// 							name="nombreDocente"
// 							placeholder="Nombre del docente"
// 							className="bg-gray-100 shadow-md rounded-lg px-1 py-1"
// 						/>
// 					</div>
// 					<div className="flex flex-col">
// 						{' '}
// 						{/*Numero de empleado*/}
// 						<label className="mb-1 text-sm font-medium">
// 							N. Empleado
// 						</label>
// 						<input
// 							readOnly
// 							type="text"
// 							name="numeroEmpleado"
// 							placeholder="Número del empleado"
// 							className="bg-gray-100 shadow-md rounded-lg px-1 py-1"
// 						/>
// 					</div>
// 					<div className="flex flex-col">
// 						{' '}
// 						{/*Formacion academica*/}
// 						<label className="mb-1 text-sm font-medium">
// 							Formación académica
// 						</label>
// 						<input
// 							readOnly
// 							type="text"
// 							name="formacionAcademica"
// 							placeholder="Formación académica"
// 							className="bg-gray-100 shadow-md rounded-lg px-1 py-1"
// 						/>
// 					</div>
// 					<div className="flex flex-col">
// 						{' '}
// 						{/*Categoria docente*/}
// 						<label className="mb-1 text-sm font-medium">
// 							Categoría de docente
// 						</label>
// 						<input
// 							readOnly
// 							type="text"
// 							name="categoriaDocente"
// 							placeholder="Categoría de docente"
// 							className="bg-gray-100 shadow-md rounded-lg px-1 py-1"
// 						/>
// 					</div>
// 					<div className="flex flex-col">
// 						{' '}
// 						{/*Jornada laboral, Falta aplicar funcionalidades*/}
// 						<label className="mb-1 text-sm font-medium">
// 							Jornada laboral
// 						</label>
// 						<select className="bg-gray-100 shadow-md rounded-lg px-1 py-1.5 text-sm">
// 							<option value="">Seleccione...</option>
// 							<option value="OpcionA">OpcionA</option>
// 							<option value="OpcionB">OpcionB</option>
// 							<option value="OpcionC">OpcionC</option>
// 						</select>
// 					</div>
// 					<div className="flex flex-col">
// 						{' '}
// 						{/*Jornada Laboral*/}
// 						<label className="mb-1 text-sm font-medium">
// 							Jornada Laboral
// 						</label>
// 						<div className="flex gap-6">
// 							<input
// 								type="time"
// 								name="horaInicio"
// 								className="bg-gray-100 shadow-md rounded-lg px-1 py-1 w-30"
// 							/>
// 							<input
// 								type="time"
// 								name="horaFinal"
// 								className="bg-gray-100 shadow-md rounded-lg px-1 py-1 w-30"
// 							/>
// 						</div>
// 					</div>
// 				</div>
//
// 				{/*Tabla DOCENCIA*/}
// 				<h2 className="text-center mt-20 mb-5 text-lg font-bold">
// 					Docencia
// 				</h2>
// 				<div className="w-full overflow-x-auto py-2">
// 					<div className="overflow-hidden rounded-t-xl shadow-md w-max mx-auto">
// 						<table className="w-full">
// 							<thead className="bg-[#144C74] text-white">
// 								<tr>
// 									<th className="py-2 px-4" colSpan={4}></th>
// 									<th
// 										className="py-2 px-4 text-center"
// 										colSpan={4}
// 									>
// 										Resultados estadísticos
// 									</th>
// 									<th className="py-2 px-4"></th>
// 								</tr>
// 								<tr>
// 									<th className="py-2 px-4">Cod.</th>{' '}
// 									{/*Encabezados de la tabla*/}
// 									<th className="py-2 px-4">Asignatura</th>
// 									<th className="py-2 px-4">Seccion</th>
// 									<th className="py-2 px-4">UV</th>
// 									<th className="py-2 px-4">APB</th>
// 									<th className="py-2 px-4">RPB</th>
// 									<th className="py-2 px-4">NSP</th>
// 									<th className="py-2 px-4">ABD</th>
// 									<th className="py-2 px-4">
// 										Total de alumnos matriculados
// 									</th>
// 								</tr>
// 							</thead>
// 							<tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-100 text-center">
// 								{' '}
// 								{/*Esta linea es para el alternado de color entre filas*/}
// 								<tr>
// 									<td className="py-fit border">IS123</td>{' '}
// 									{/*Datos de prueba, falta automatizar esto cuando el backend este listo*/}
// 									<td className="py-fit border">Topicos</td>
// 									<td className="py-fit border">19:00</td>
// 									<td className="py-fit border">3</td>
// 									{/*Datos que el usuario va a ingresar*/}
// 									<td className="py-fit border">
// 										<input
// 											type="number"
// 											name="apb"
// 											className="w-12 ps-1"
// 										></input>
// 									</td>
// 									<td className="py-fit border">
// 										<input
// 											type="number"
// 											name="rpb"
// 											className="w-12 ps-1"
// 										></input>
// 									</td>
// 									<td className="py-fit border">
// 										<input
// 											type="number"
// 											name="nsp"
// 											className="w-12 ps-1"
// 										></input>
// 									</td>
// 									<td className="py-fit border">
// 										<input
// 											type="number"
// 											name="abd"
// 											className="w-12 ps-1"
// 										></input>
// 									</td>
// 									<td className="py-fit border">17</td>
// 								</tr>
// 							</tbody>
// 							<tfoot>
// 								<tr>
// 									<td colSpan={9}>
// 										<div className="flex justify-center">
// 											<div className="grid grid-cols-2 gap-4 p-4">
// 												<div className="flex flex-col">
// 													{/*Hora de consultas*/}
// 													<label className="mb-1 text-sm font-medium">
// 														Hora de consulta:
// 													</label>
// 													<input
// 														type="time"
// 														name="horaConsulta"
// 														className="bg-gray-100 shadow-md rounded-md px-1 py-1 w-30"
// 													/>
// 												</div>
// 												<div className="flex flex-col">
// 													{/*Hora de tutorias*/}
// 													<label className="mb-1 text-sm font-medium">
// 														Hora de tutorias:
// 													</label>
// 													<input
// 														type="time"
// 														name="horaTutorias"
// 														className="bg-gray-100 shadow-md rounded-md px-1 py-1 w-30"
// 													/>
// 												</div>
// 											</div>
// 										</div>
// 									</td>
// 								</tr>
// 							</tfoot>
// 						</table>
// 					</div>
// 				</div>
// 				{/*Fin tabla DOCENCIA*/}
//
// 				{/*Titulo y botones agregar y quitar fila INVESTIGACION*/}
// 				<h2 className="text-center mt-20 mb-5 text-lg font-bold">
// 					Investigación
// 				</h2>
// 				<div className="flex flex-row gap-10 justify-center mb-5">
// 					<button
// 						type="button"
// 						onClick={() =>
// 							addRowActVin(
// 								investigacionRows,
// 								setInvestigacionRows
// 							)
// 						}
// 						className="w-[150px] justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 rounded-xl transition flex flex-row gap-2 duration-500"
// 					>
// 						<PlusCircleIcon className="size-6" />
// 						Agregar fila
// 					</button>
// 					<button
// 						type="button"
// 						onClick={() =>
// 							removeRowActVin(
// 								investigacionRows,
// 								setInvestigacionRows
// 							)
// 						}
// 						className="w-[150px] justify-center bg-[#DC3545] text-white p-2 hover:bg-red-300 rounded-xl transition flex flex-row gap-2 duration-500"
// 					>
// 						<MinusCircleIcon className="size-6" />
// 						Quitar fila
// 					</button>
// 				</div>
// 				{/*Tabla INVESTIGACION*/}
// 				<div className="w-full overflow-x-auto py-2">
// 					<div className="overflow-hidden rounded-t-xl shadow-md w-max mx-auto">
// 						<table className="w-full">
// 							<thead className="bg-[#144C74] text-white">
// 								<tr>
// 									<th className="py-2 px-4" colSpan={2}></th>
// 									<th
// 										className="py-2 px-4 text-center"
// 										colSpan={2}
// 									>
// 										Registrado?
// 									</th>
// 									<th className="py-2 px-4" colSpan={3}></th>
// 								</tr>
// 								<tr>
// 									<th className="py-2 px-4">No.</th>{' '}
// 									{/*Encabezados de la tabla*/}
// 									<th className="py-2 px-4">
// 										Nombre del proyecto
// 									</th>
// 									<th className="py-2 px-4">Si</th>
// 									<th className="py-2 px-4">No</th>
// 									<th className="py-2 px-4">
// 										No. de Expediente
// 									</th>
// 									<th className="py-2 px-4">
// 										Nivel de avance
// 									</th>
// 									<th className="py-2 px-4">
// 										Medio de verificación
// 									</th>
// 								</tr>
// 							</thead>
// 							<tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-100 text-center">
// 								{' '}
// 								{/*Aqui falta la logica con el backend, puede que despues se cambien cosas*/}
// 								{investigacionRows.map((fila, index) => (
// 									<tr key={index}>
// 										<td className="py-fit border">
// 											<input
// 												name="numeroInv"
// 												readOnly
// 												value={index + 1}
// 												className="w-12 ps-1 text-center"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="nombreInv"
// 												type="text"
// 												className="ps-1 text-center"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="siRegInv"
// 												type="checkbox"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="noRegInv"
// 												type="checkbox"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="numeroExpInv"
// 												type="number"
// 												className="w-full text-center ps-1"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<select className="py-1 text-sm w-full">
// 												<option value="">
// 													Seleccione...
// 												</option>
// 												<option value="OpcionA">
// 													OpcionA
// 												</option>
// 												<option value="OpcionB">
// 													OpcionB
// 												</option>
// 												<option value="OpcionC">
// 													OpcionC
// 												</option>
// 											</select>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="medVerVin"
// 												type="text"
// 												className="ps-1 text-center"
// 											/>
// 										</td>
// 									</tr>
// 								))}
// 							</tbody>
// 						</table>
// 					</div>
// 				</div>
// 				{/*Fin tabla INVESTIGACION*/}
//
// 				{/*Titulo y botones agregar y quitar fila VINCULACION*/}
// 				<h2 className="text-center mt-20 mb-5 text-lg font-bold">
// 					Vinculación
// 				</h2>
// 				<div className="flex flex-row gap-10 justify-center mb-5">
// 					<button
// 						type="button"
// 						onClick={() =>
// 							addRowActVin(vinculacionRows, setVinculacionRows)
// 						}
// 						className="w-[150px] justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 rounded-xl transition flex flex-row gap-2 duration-500"
// 					>
// 						<PlusCircleIcon className="size-6" />
// 						Agregar fila
// 					</button>
// 					<button
// 						type="button"
// 						onClick={() =>
// 							removeRowActVin(vinculacionRows, setVinculacionRows)
// 						}
// 						className="w-[150px] justify-center bg-[#DC3545] text-white p-2 hover:bg-red-300 rounded-xl transition flex flex-row gap-2 duration-500"
// 					>
// 						<MinusCircleIcon className="size-6" />
// 						Quitar fila
// 					</button>
// 				</div>
// 				{/*Tabla VINCULACION*/}
// 				<div className="w-full overflow-x-auto py-2">
// 					<div className="overflow-hidden rounded-t-xl shadow-md w-max mx-auto">
// 						<table className="w-full">
// 							<thead className="bg-[#144C74] text-white">
// 								<tr>
// 									<th className="py-2 px-4" colSpan={2}></th>
// 									<th
// 										className="py-2 px-4 text-center"
// 										colSpan={2}
// 									>
// 										Registrado?
// 									</th>
// 									<th className="py-2 px-4" colSpan={3}></th>
// 								</tr>
// 								<tr>
// 									<th className="py-2 px-4">No.</th>{' '}
// 									{/*Encabezados de la tabla*/}
// 									<th className="py-2 px-4">
// 										Nombre del proyecto
// 									</th>
// 									<th className="py-2 px-4">Si</th>
// 									<th className="py-2 px-4">No</th>
// 									<th className="py-2 px-4">
// 										No. de Expediente
// 									</th>
// 									<th className="py-2 px-4">
// 										Nivel de avance
// 									</th>
// 									<th className="py-2 px-4">
// 										Medio de verificación
// 									</th>
// 								</tr>
// 							</thead>
// 							<tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-100 text-center">
// 								{' '}
// 								{/*Aqui falta la logica con el backend, puede que despues se cambien cosas*/}
// 								{vinculacionRows.map((fila, index) => (
// 									<tr key={index}>
// 										<td className="py-fit border">
// 											<input
// 												name="numeroVinc"
// 												readOnly
// 												value={index + 1}
// 												className="rounded-md w-12 ps-1 text-center"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="nombreVinc"
// 												type="text"
// 												className="ps-1 text-center"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="siRegVin"
// 												type="checkbox"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="noRegVin"
// 												type="checkbox"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="numeroExpVin"
// 												type="number"
// 												className="w-full ps-1 text-center"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<select className="py-1 text-sm w-full">
// 												<option value="">
// 													Seleccione...
// 												</option>
// 												<option value="OpcionA">
// 													OpcionA
// 												</option>
// 												<option value="OpcionB">
// 													OpcionB
// 												</option>
// 												<option value="OpcionC">
// 													OpcionC
// 												</option>
// 											</select>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="medVerVin"
// 												type="text"
// 												className="ps-1 text-center"
// 											/>
// 										</td>
// 									</tr>
// 								))}
// 							</tbody>
// 						</table>
// 					</div>
// 				</div>
// 				{/*Fin tabla VINCULACION*/}
//
// 				{/*Titulo y botones agregar y quitar fila INNOVACION*/}
// 				<h2 className="text-center mt-20 mb-5 text-lg font-bold">
// 					Innovación educativa
// 				</h2>
// 				<div className="flex flex-row gap-10 justify-center mb-5">
// 					<button
// 						type="button"
// 						onClick={() => addRowInnDisOtr(innRows, setInnRows)}
// 						className="w-[150px] justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 rounded-xl transition flex flex-row gap-2 duration-500"
// 					>
// 						<PlusCircleIcon className="size-6" />
// 						Agregar fila
// 					</button>
// 					<button
// 						type="button"
// 						onClick={() => removeRowInnDisOtr(innRows, setInnRows)}
// 						className="w-[150px] justify-center bg-[#DC3545] text-white p-2 hover:bg-red-300 rounded-xl transition flex flex-row gap-2 duration-500"
// 					>
// 						<MinusCircleIcon className="size-6" />
// 						Quitar fila
// 					</button>
// 				</div>
// 				{/*Tabla INNOVACION*/}
// 				<div className="w-full overflow-x-auto py-2">
// 					<div className="overflow-hidden rounded-t-xl shadow-md w-max mx-auto">
// 						<table className="w-full">
// 							<thead className="bg-[#144C74] text-white">
// 								<tr>
// 									<th className="py-2 px-4">No.</th>{' '}
// 									{/*Encabezados de la tabla*/}
// 									<th className="py-2 px-4">
// 										Nombre del proyecto
// 									</th>
// 									<th className="py-2 px-4">
// 										Nivel de avance
// 									</th>
// 									<th className="py-2 px-4">
// 										Medio de verificación
// 									</th>
// 								</tr>
// 							</thead>
// 							<tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-100 text-center">
// 								{' '}
// 								{/*Aqui falta la logica con el backend, puede que despues se cambien cosas*/}
// 								{innRows.map((fila, index) => (
// 									<tr key={index}>
// 										<td className="py-fit border">
// 											<input
// 												name="numeroInn"
// 												readOnly
// 												value={index + 1}
// 												className="w-12 ps-1 text-center"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="nombreInn"
// 												type="text"
// 												className="ps-1 text-center"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<select className="w-full py-1 text-sm">
// 												<option value="">
// 													Seleccione...
// 												</option>
// 												<option value="OpcionA">
// 													OpcionA
// 												</option>
// 												<option value="OpcionB">
// 													OpcionB
// 												</option>
// 												<option value="OpcionC">
// 													OpcionC
// 												</option>
// 											</select>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="medVerInn"
// 												type="text"
// 												className="ps-1 text-center"
// 											/>
// 										</td>
// 									</tr>
// 								))}
// 							</tbody>
// 						</table>
// 					</div>
// 				</div>
// 				{/*Fin tabla INNOVACION*/}
//
// 				{/*Titulo y botones agregar y quitar fila DISEÑO CURRICULAR*/}
// 				<h2 className="text-center mt-20 mb-5 text-lg font-bold">
// 					Diseño o rediseño curricular
// 				</h2>
// 				<div className="flex flex-row gap-10 justify-center mb-5">
// 					<button
// 						type="button"
// 						onClick={() =>
// 							addRowInnDisOtr(disCurRows, setDisCurRows)
// 						}
// 						className="w-[150px] justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 rounded-xl transition flex flex-row gap-2 duration-500"
// 					>
// 						<PlusCircleIcon className="size-6" />
// 						Agregar fila
// 					</button>
// 					<button
// 						type="button"
// 						onClick={() =>
// 							removeRowInnDisOtr(disCurRows, setDisCurRows)
// 						}
// 						className="w-[150px] justify-center bg-[#DC3545] text-white p-2 hover:bg-red-300 rounded-xl transition flex flex-row gap-2 duration-500"
// 					>
// 						<MinusCircleIcon className="size-6" />
// 						Quitar fila
// 					</button>
// 				</div>
// 				{/*Tabla DISEÑO CURRICULAR*/}
// 				<div className="w-full overflow-x-auto py-2">
// 					<div className="overflow-hidden rounded-t-xl shadow-md w-max mx-auto">
// 						<table className="w-full">
// 							<thead className="bg-[#144C74] text-white">
// 								<tr>
// 									<th className="py-2 px-4">No.</th>{' '}
// 									{/*Encabezados de la tabla*/}
// 									<th className="py-2 px-4">
// 										Nombre del proyecto
// 									</th>
// 									<th className="py-2 px-4">
// 										Nivel de avance
// 									</th>
// 									<th className="py-2 px-4">
// 										Medio de verificación
// 									</th>
// 								</tr>
// 							</thead>
// 							<tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-100 text-center">
// 								{' '}
// 								{/*Aqui falta la logica con el backend, puede que despues se cambien cosas*/}
// 								{disCurRows.map((fila, index) => (
// 									<tr key={index}>
// 										<td className="py-fit border">
// 											<input
// 												name="numeroDisCur"
// 												readOnly
// 												value={index + 1}
// 												className="w-12 ps-1 text-center"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="nombreDisCur"
// 												type="text"
// 												className="text-center ps-1"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<select className="w-full py-1 text-sm">
// 												<option value="">
// 													Seleccione...
// 												</option>
// 												<option value="OpcionA">
// 													OpcionA
// 												</option>
// 												<option value="OpcionB">
// 													OpcionB
// 												</option>
// 												<option value="OpcionC">
// 													OpcionC
// 												</option>
// 											</select>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="medVerDisCur"
// 												type="text"
// 												className="ps-1 text-center"
// 											/>
// 										</td>
// 									</tr>
// 								))}
// 							</tbody>
// 						</table>
// 					</div>
// 				</div>
// 				{/*Fin tabla DISEÑO CURRICULAR*/}
//
// 				{/*Tabla Cargo de GESTION ACADEMICA*/}
// 				<h2 className="text-center mt-20 mb-5 text-lg font-bold">
// 					Cargo de gestión académica
// 				</h2>
// 				<CargosDocenteForm valores={cargos} onChange={setCargos} />
//
// 				{/*Titulo y botones agregar y quitar fila Otras Actividades*/}
// 				<h2 className="text-center mt-20 mb-5 text-lg font-bold">
// 					Otras actividades
// 				</h2>
// 				<div className="flex flex-row gap-10 justify-center mb-5">
// 					<button
// 						type="button"
// 						onClick={() =>
// 							addRowInnDisOtr(otrasActRows, setOtrasActRows)
// 						}
// 						className="w-[150px] justify-center bg-[#5BC85C] text-white p-2 hover:bg-green-300 rounded-xl transition flex flex-row gap-2 duration-500"
// 					>
// 						<PlusCircleIcon className="size-6" />
// 						Agregar fila
// 					</button>
// 					<button
// 						type="button"
// 						onClick={() =>
// 							removeRowInnDisOtr(otrasActRows, setOtrasActRows)
// 						}
// 						className="w-[150px] justify-center bg-[#DC3545] text-white p-2 hover:bg-red-300 rounded-xl transition flex flex-row gap-2 duration-500"
// 					>
// 						<MinusCircleIcon className="size-6" />
// 						Quitar fila
// 					</button>
// 				</div>
// 				{/*Tabla Otras actividades*/}
// 				<div className="w-full overflow-x-auto py-2">
// 					<div className="overflow-hidden rounded-t-xl shadow-md w-max mx-auto">
// 						<table className="w-full">
// 							<thead className="bg-[#144C74] text-white">
// 								<tr>
// 									<th className="py-2 px-4">No.</th>{' '}
// 									{/*Encabezados de la tabla*/}
// 									<th className="py-2 px-4">
// 										Nombre del proyecto
// 									</th>
// 									<th className="py-2 px-4">
// 										Nivel de avance
// 									</th>
// 									<th className="py-2 px-4">
// 										Medio de verificación
// 									</th>
// 								</tr>
// 							</thead>
// 							<tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-100 text-center">
// 								{' '}
// 								{/*Aqui falta la logica con el backend, puede que despues se cambien cosas*/}
// 								{otrasActRows.map((fila, index) => (
// 									<tr key={index}>
// 										<td className="py-fit border">
// 											<input
// 												name="numeroOtras"
// 												readOnly
// 												value={index + 1}
// 												className="rounded-md w-12 ps-1 text-center"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="nombreOtras"
// 												type="text"
// 												className="ps-1 text-center"
// 											/>
// 										</td>
// 										<td className="py-fit border">
// 											<select className="w-full py-1 text-sm">
// 												<option value="">
// 													Seleccione...
// 												</option>
// 												<option value="OpcionA">
// 													OpcionA
// 												</option>
// 												<option value="OpcionB">
// 													OpcionB
// 												</option>
// 												<option value="OpcionC">
// 													OpcionC
// 												</option>
// 											</select>
// 										</td>
// 										<td className="py-fit border">
// 											<input
// 												name="medVerOtras"
// 												type="text"
// 												className="ps-1 text-center"
// 											/>
// 										</td>
// 									</tr>
// 								))}
// 							</tbody>
// 						</table>
// 					</div>
// 				</div>
// 				{/*Fin tabla Otras actividades*/}
//
// 				{/*Espacio para subir imagenes*/}
// 				<h2 className="text-center mt-20 mb-5 text-lg font-bold">
// 					Subir imagenes de actividades
// 				</h2>
// 				<ImagenesUpload />
//
// 				{/*Fin del formulario*/}
// 				<button
// 					type="submit"
// 					className="mx-auto w-[150px] justify-center mt-10 mb-50
//          bg-[#C40C54] text-white p-2 hover:bg-pink-500
//           rounded-xl transition flex flex-row gap-2 duration-500"
// 				>
// 					<DocumentArrowUpIcon className="size-6" />
// 					Enviar informe
// 				</button>
// 			</form>
// 		</>
// 	);
// };
