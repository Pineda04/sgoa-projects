import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { CourseClassroomsTable } from '@features/academic/planifications';
import {
	PlusCircleIcon,
	DocumentCheckIcon,
	ArrowUpTrayIcon,
	TrashIcon,
	PencilIcon,
} from '@heroicons/react/24/outline';
import { useUser } from '@config/providers';
import { useGetAcademicPeriodNextToCreate } from '@api/periods';
import { useGetAllCoursesCoordinatorByPeriod } from '@api/courses';
import { useModal } from '@shared/hooks';
import { TPlanification, TPlanificationWithErrors, useCreateAcademicAssignmentArrayMutation } from '@api/assignment-reports';
import { ESwalIcons, genericAlert } from '@shared/utils';
import { Button, Loading, ModalBase } from '@shared/components';
import { PlanificationForm, UploadPlanification } from '@features/academic/course-classrooms';

export const CreatePlanification = () => {
	const navigate = useNavigate();

	const { centerDepartmentId } = useParams();

	const currentUser = useUser();
	const currentCenter = currentUser.headPositions.find(
		p => p.centerDepartmentId === centerDepartmentId
	);

	const academicPeriodNextToCreate = useGetAcademicPeriodNextToCreate();
	const coursesInfo = useGetAllCoursesCoordinatorByPeriod(
		academicPeriodNextToCreate.data?.id || '',
		centerDepartmentId
	);

	const isLoading = [academicPeriodNextToCreate, coursesInfo].some(
		q => q.isLoading
	);

	const [isOpenFormModal, handleShowFormModal, handleCloseFormModal] =
		useModal();
	const [isOpenUploadModal, handleShowUploadModal, handleCloseUploadModal] =
		useModal();
	const [
		isOpenInvalidElements,
		handleShowInvalidElements,
		handleCloseInvalidElements,
	] = useModal();

	const [rows, setRows] = useState<TPlanification[]>([]);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	const [invalidElements, setInvalidElements] = useState<
		TPlanificationWithErrors[]
	>([]);

	const { mutateAsync } = useCreateAcademicAssignmentArrayMutation();

	const openAdd = () => {
		setEditingIndex(null);
		handleShowFormModal();
	};

	const openEdit = (index: number) => {
		setEditingIndex(index);
		handleShowFormModal();
	};

	const handleDelete = (index: number) => {
		setRows(rows.filter((_, i) => i !== index));
	};

	const handleSave = (data: TPlanification) => {
		if (editingIndex !== null) {
			setRows(rows.map((r, i) => (i === editingIndex ? data : r)));
		} else {
			setRows([...rows, data]);
		}
		handleCloseFormModal();
	};

	const handleUploadSuccess = (
		uploadedData: TPlanification[],
		invalidElements: TPlanificationWithErrors[],
		addInvalidToTable: boolean = false
	) => {
		const rowsToSet = addInvalidToTable
			? [...uploadedData, ...invalidElements]
			: uploadedData;

		setRows(rowsToSet);

		if (invalidElements.length) {
			setInvalidElements([...invalidElements]);
			handleShowInvalidElements();
		}
	};

	const handleSend = async () => {
		if (rows.length === 0) {
			genericAlert(
				'Debes agregar al menos una fila antes de guardar.',
				ESwalIcons.ERROR
			);
			return;
		}

		if (!centerDepartmentId) {
			genericAlert(
				'No se encontró el ID del centro-departamento en la URL',
				ESwalIcons.ERROR
			);
			return;
		}

		await mutateAsync(
			{
				centerDepartmentId,
				assignments: rows,
			},
			{
				onSuccess: () => {
					navigate(
						`/academic/course-classrooms/${centerDepartmentId}`
					);
				},
				onError: (error: unknown) => {
					const axiosError = error as AxiosError<{
						data: {
							courses: TPlanification[];
							invalidElements: TPlanificationWithErrors[];
						};
					}>;

					// NOTE: Se quedan en la tabla para corregir.
					if (axiosError.response?.data?.data) {
						handleUploadSuccess(
							axiosError.response.data.data.courses ?? [],
							axiosError.response.data.data.invalidElements,
							true
						);
					}
				},
			}
		);
	};

	if (isLoading) return <Loading />;

	return (
		<>
			<div className="mt-10 flex flex-col items-center">
				<p className="text-2xl font-semibold">
					{currentCenter?.center.name ?? 'UNAH Campus Copán'}
				</p>
				<p className="text-1xl font-semibold">
					{currentCenter?.department.name ?? ''}
				</p>
				<p>
					Asignación Académica Presencial | Pac No.{' '}
					{academicPeriodNextToCreate.data?.pac} año{' '}
					{academicPeriodNextToCreate.data?.year}
				</p>
			</div>

			<div className="mb-6 mt-6 flex justify-center gap-4">
				<Button
					onClick={openAdd}
					className="flex items-center justify-center gap-2 bg-[#5BC85C] text-white px-4 py-2 hover:bg-green-300 transition duration-300 cursor-pointer"
					variant="unstyled"
					size="default"
				>
					<PlusCircleIcon className="h-5 w-5" />
					Agregar fila
				</Button>

				<Button
					onClick={handleShowUploadModal}
					className="flex items-center justify-center gap-2 bg-[#3B82F6] text-white px-4 py-2 hover:bg-blue-400 transition duration-300 cursor-pointer"
					variant="unstyled"
					size="default"
				>
					<ArrowUpTrayIcon className="h-5 w-5" />
					Subir desde archivo
				</Button>
			</div>

			{/* Tabla de filas */}
			<div className="w-full overflow-x-auto py-2 px-5 text-sm">
				<div className="overflow-hidden rounded-md shadow-md overflow-x-auto mx-auto">
					<table className="w-full">
						<thead className="bg-[#144C74] text-white">
							<tr>
								<th className="py-2 px-4">#</th>
								<th className="py-2 px-4">No. Empleado</th>
								<th className="py-2 px-4">Nombre</th>
								<th className="py-2 px-4">Código</th>
								<th className="py-2 px-4">Asignatura</th>
								<th className="py-2 px-4">Sección</th>
								<th className="py-2 px-4">UV</th>
								<th className="py-2 px-4">Días</th>
								<th className="py-2 px-4">No. Alumnos</th>
								<th className="py-2 px-4">N° de Aula</th>
								<th className="py-2 px-4">Carrera/Área</th>
								<th className="py-2 px-4">Jefe/Coordinador</th>
								<th className="py-2 px-4">Centro</th>
								<th className="py-2 px-4">Est. Por Egresar</th>
								<th className="py-2 px-4">Observaciones</th>
								<th className="py-2 px-4">Acciones</th>
							</tr>
						</thead>

						<tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-100 text-center">
							{rows.length === 0 ? (
								<tr>
									<td
										colSpan={15}
										className="py-6 text-gray-500"
									>
										Sin registros. Presiona "Agregar fila"
										para crear.
									</td>
								</tr>
							) : (
								rows.map((r, i) => (
									<tr id={i.toString()} key={i}>
										<td className="py-2 px-2 border">
											{i + 1}
										</td>
										<td className="py-2 px-2 border">
											{r.teacherCode}
										</td>
										<td className="py-2 px-2 border">
											{r.teacherName}
										</td>
										<td className="py-2 px-2 border">
											{r.courseCode}
										</td>
										<td className="py-2 px-2 border">
											{r.courseName}
										</td>
										<td className="py-2 px-2 border">
											{r.section}
										</td>
										<td className="py-2 px-2 border">
											{r.uv}
										</td>
										<td className="py-2 px-2 border">
											{r.days}
										</td>
										<td className="py-2 px-2 border">
											{r.studentCount}
										</td>
										<td className="py-2 px-2 border">
											{r.classroomName}
										</td>
										<td className="py-2 px-2 border">
											{r.departmentName}
										</td>
										<td className="py-2 px-2 border">
											{r.coordinator}
										</td>
										<td className="py-2 px-2 border">
											{r.center}
										</td>
										<td className="py-2 px-2 border">
											{r.nearGraduation ? 'Sí' : 'No'}
										</td>
										<td className="py-2 px-2 border">
											{r.observation}
										</td>
										<td className="py-2 px-2 border">
											<div className="flex gap-2 justify-center">
												<Button
													onClick={() => openEdit(i)}
													className="p-1.5 bg-blue-500 text-white hover:bg-blue-600 transition duration-200"
													title="Editar"
													variant="unstyled"
												>
													<PencilIcon className="h-3.5 w-3.5" />
												</Button>

												<Button
													onClick={() =>
														handleDelete(i)
													}
													className="p-1.5 bg-red-500 text-white hover:bg-red-600 transition duration-200"
													title="Eliminar"
													variant="unstyled"
												>
													<TrashIcon className="h-3.5 w-3.5" />
												</Button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
      </div>

			{coursesInfo.data &&
				coursesInfo.data.length &&
				!coursesInfo.isError && (
					<div className="text-center mt-10">
						<h1 className="text-lg font-semibold">
							Asignaturas ya agregadas
						</h1>
						<CourseClassroomsTable
							coursesInfo={coursesInfo.data}
							isWhithActions
						/>
					</div>
				)}

			<div className="flex justify-center my-8">
				<Button
					className="mx-auto w-fit justify-center mt-2 mb-10 bg-[#C40C54] text-white p-2 hover:bg-pink-500 transition flex items-center gap-2 duration-500, cursor-pointer"
					onClick={handleSend}
					variant="unstyled"
				>
					<DocumentCheckIcon className="h-5 w-5" />
					Guardar planificación
				</Button>
			</div>

			{/* Modal Base para agregar y tambien editar */}
			<ModalBase isOpen={isOpenFormModal} onClose={handleCloseFormModal}>
				<PlanificationForm
					centerDepartmentId={centerDepartmentId ?? ''}
					initialData={
						editingIndex !== null ? rows[editingIndex] : undefined
					}
					onCancel={handleCloseFormModal}
					onSubmit={handleSave}
				/>
			</ModalBase>

			{/* Modal para subir Excel */}
			<ModalBase
				isOpen={isOpenUploadModal}
				onClose={handleCloseUploadModal}
			>
				<UploadPlanification
					centerDepartmentId={centerDepartmentId ?? ''}
					onUploadSuccess={handleUploadSuccess}
					onCloseModal={handleCloseUploadModal}
				/>
			</ModalBase>

			{/* Modal para mostrar los elementos con errores */}
			<ModalBase
				isOpen={isOpenInvalidElements}
				onClose={handleCloseInvalidElements}
			>
				<div className="mt-2 h-[50vh] overflow-auto">
					<div className="sticky top-0 z-20 bg-white mb-5">
						<h1 className="text-2xl font-semibold">
							Asignaturas con errores
						</h1>
						<hr className="h-px my-2 bg-gray-200 border-0" />
					</div>
					{invalidElements.map(el => (
						<div
							key={el.id}
							className="m-6 block w-auto rounded-lg border border-gray-400 bg-white hover:bg-gray-100"
						>
							<div className="border-b border-gray-400 p-4">
								<h5 className="mb-2 text-2xl font-bold tracking-tight">
									# {el.id}
								</h5>
							</div>

							<div className="p-4">
								<h6 className="mb-2 text-xl font-bold tracking-tight">
									Datos:
								</h6>
								<dl className="grid grid-cols-1 gap-10 sm:grid-cols-2 xl:grid-cols-2">
									<div>
										<dt className="font-bold">Docente</dt>
										<dd>
											{el.teacherCode} - {el.teacherName}
										</dd>
									</div>

									<div>
										<dt className="font-bold">
											Asignatura
										</dt>
										<dd>
											{el.courseCode} - {el.courseName}
										</dd>
									</div>

									<div>
										<dt className="font-bold">Horario</dt>
										<dd>
											{el.section} - {el.days}
										</dd>
									</div>

									<div>
										<dt className="font-bold">
											Salón de clase
										</dt>
										<dd>{el.classroomName}</dd>
									</div>
								</dl>
							</div>

							<div className="border-t border-gray-400 p-4">
								<h6 className="mb-2 text-xl font-bold tracking-tight">
									Errores:
								</h6>
								<ul className="list-decimal list-inside">
									{el.errors.map((err, i) => (
										<li key={i}>{err}</li>
									))}
								</ul>
							</div>
						</div>
					))}
				</div>
			</ModalBase>
		</>
	);
};
