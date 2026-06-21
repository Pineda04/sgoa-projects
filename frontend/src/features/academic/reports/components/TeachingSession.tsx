import { TTeachingSession, useUpdateTeachingSession } from '@api/teachers';
import { Button } from '@shared/components';
import { toHondurasTimeInput } from '@shared/utils';
import { useEffect, useState } from 'react';
import { CourseStadisticEdit } from './CourseStadisticEdit';
import {
	PencilIcon,
	CheckCircleIcon,
	XCircleIcon,
} from '@heroicons/react/24/outline';

export const TeachingSession = ({
	reportId,
	data,
	mode,
}: {
	reportId: string;
	data?: TTeachingSession;
	mode: 'view' | 'edit';
}) => {
	// Mutation
	// NOTE: Para actualizar consult y tutoring hour es con data?.id
	const { updateTeachingSession } = useUpdateTeachingSession(reportId);
	const [isInputsActive, setIsInputsActive] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const [horaConsulta, setHoraConsulta] = useState<string>(
		data ? toHondurasTimeInput(data.consultHour) : ''
	);
	const [horaTutorias, setHoraTutorias] = useState<string>(
		data ? toHondurasTimeInput(data.tutoringHour) : ''
	);

	//Horas originales pero HH:MM
	const [originalConsulta, setOriginalConsulta] = useState(
		data ? toHondurasTimeInput(data.consultHour) : ''
	);
	const [originalTutorias, setOriginalTutorias] = useState(
		data ? toHondurasTimeInput(data.tutoringHour) : ''
	);

	useEffect(() => {
		setHoraConsulta(originalConsulta);
		setHoraTutorias(originalTutorias);
	}, [data, originalConsulta, originalTutorias]);

	//Darle formato correcto a las horas.
	const formatTimeToISO = (
		timeStr: string,
		referenceIso?: string
	): string => {
		const [hhStr, mmStr] = timeStr.split(':');
		const hh = Number(hhStr);
		const mm = Number(mmStr);

		const refDate = referenceIso ? new Date(referenceIso) : new Date();

		const year = refDate.getFullYear();
		const month = refDate.getMonth();
		const day = refDate.getDate();

		const local = new Date(year, month, day, hh, mm, 0, 0);

		const iso = local.toISOString();
		return iso.split('.')[0] + 'Z';
	};

	//Handle Botones de aceptar/cancelar
	const handleSave = async () => {
		if (!data) return;

		setIsSaving(true);
		const consultIso = formatTimeToISO(horaConsulta, data.consultHour);
		const tutoringIso = formatTimeToISO(horaTutorias, data.tutoringHour);

		await updateTeachingSession({
			courseClassroomId: data.id,
			body: {
				consultHour: consultIso,
				tutoringHour: tutoringIso,
			},
		});

		setOriginalConsulta(horaConsulta);
		setOriginalTutorias(horaTutorias);

		setIsInputsActive(false);
		setIsSaving(false);
	};

	const handleCancel = () => {
		setHoraConsulta(originalConsulta);
		setHoraTutorias(originalTutorias);
		setIsInputsActive(false);
	};

	return (
		<>
			<div className="overflow-x-auto rounded-lg shadow-md mx-auto mt-5">
				<table className="w-full min-w-175">
					<thead className="bg-[#144C74] text-white">
						<tr>
							<th className="py-2 px-4" colSpan={5}></th>
							<th
								className="py-2 px-4 text-center"
								colSpan={mode === 'edit' ? 4 : 3}
							>
								Resultados estadísticos
							</th>
							<th className="py-2 px-4"></th>
						</tr>
						<tr>
							<th className="py-2 px-4">Cod.</th>
							{/*Encabezados de la tabla*/}
							<th className="py-2 px-4">Asignatura</th>
							<th className="py-2 px-4">Sección</th>
							<th className="py-2 px-4">UV</th>
							<th className="py-2 px-4">APB</th>
							<th className="py-2 px-4">RPB</th>
							<th className="py-2 px-4">NSP</th>
							<th className="py-2 px-4">ABD</th>
							<th className="py-2 px-4">
								Total de alumnos matriculados
							</th>
							{mode === 'edit' && (
								<th className="py-2 px-4">Acciones</th>
							)}
						</tr>
					</thead>
					<tbody className="[&>tr:nth-child(odd)]:bg-white [&>tr:nth-child(even)]:bg-gray-100 text-center">
						{/*Esta linea es para el alternado de color entre filas*/}
						{data &&
							data.courseClassrooms.map(cc => (
								<CourseStadisticEdit
									key={cc.id}
									reportId={reportId}
									infoCourseClassroom={cc}
									mode={mode}
								/>
							))}
					</tbody>
					<tfoot>
						<tr>
							<td colSpan={10}>
								<div className="flex justify-center">
									<div className="grid grid-cols-4 gap-4 p-4">
										<div></div>
										<div className="flex flex-col">
											{/*Hora de consultas*/}
											<label className="mb-1 text-sm font-medium">
												Hora de consulta:
											</label>
											<input
												type="time"
												name="horaConsulta"
												disabled={
													!isInputsActive || isSaving
												}
												className={`shadow-md rounded-md px-1 py-1 w-30 ${
													isInputsActive
														? 'bg-white border'
														: 'bg-gray-100'
												}`}
												value={horaConsulta}
												onChange={e =>
													setHoraConsulta(
														e.target.value
													)
												}
											/>
										</div>
										<div className="flex flex-col">
											{/*Hora de tutorias*/}
											<label className="mb-1 text-sm font-medium">
												Hora de tutorias:
											</label>
											<input
												type="time"
												name="horaTutorias"
												disabled={
													!isInputsActive || isSaving
												}
												className={`shadow-md rounded-md px-1 py-1 w-30 ${
													isInputsActive
														? 'bg-white border'
														: 'bg-gray-100'
												}`}
												value={horaTutorias}
												onChange={e =>
													setHoraTutorias(
														e.target.value
													)
												}
											/>
										</div>
										{mode === 'edit' && (
											<>
												{isInputsActive ? (
													<div className="flex gap-2 justify-center my-auto mx-auto h-fit w-fit p-2 sm:mx-0">
														<Button
															type="button"
															onClick={handleSave}
															disabled={isSaving}
														>
															<CheckCircleIcon className="size-7 hover:text-[#5BC85C] transition duration-250" />
														</Button>
														<Button
															type="button"
															onClick={
																handleCancel
															}
														>
															<XCircleIcon className="size-7 hover:text-[#DC3545] transition duration-250" />
														</Button>
													</div>
												) : (
													<Button
														type="button"
														className="my-auto mx-auto h-fit w-fit p-2 sm:mx-0 cursor-pointer"
														onClick={() =>
															setIsInputsActive(
																true
															)
														}
														variant="unstyled"
													>
														<PencilIcon className="size-6 text-[#144C74] hover:text-[#FCC40C] transition duration-250" />
													</Button>
												)}
											</>
										)}
									</div>
								</div>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</>
	);
};
