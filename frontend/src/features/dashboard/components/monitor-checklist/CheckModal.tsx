import { useEffect, useState } from 'react';
import { useCreateCheckMutation } from '@api/monitor';
import {
	TMonitorAssignmentCheckStatus,
	TMonitorCurrentAssignment,
} from '@api/monitor';
import { Button, ModalBase } from '@shared';
import {
	formatDays,
	getCurrentTimeString,
	getTodayDateString,
	parseStartTime,
} from './checklist.utils';

interface CheckModalProps {
	isOpen: boolean;
	onClose: () => void;
	assignment: TMonitorCurrentAssignment | null;
	buildingName: string;
	classroomName: string;
	onCheckComplete: (
		courseClassroomId: string,
		check: TMonitorAssignmentCheckStatus
	) => void;
}

export const CheckModal = ({
	isOpen,
	onClose,
	assignment,
	buildingName,
	classroomName,
	onCheckComplete,
}: CheckModalProps) => {
	const [isPresent, setIsPresent] = useState<boolean | null>(null);
	const [observation, setObservation] = useState('');
	const { createCheck, isPendingCreateCheck } = useCreateCheckMutation();

	useEffect(() => {
		if (isOpen) {
			setIsPresent(null);
			setObservation('');
		}
	}, [isOpen, assignment?.courseClassroomId]);

	if (!assignment) return null;

	const startTime = parseStartTime(assignment.section);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isPresent === null) return;

		try {
			const res = await createCheck({
				courseClassroomId: assignment.courseClassroomId,
				checkDate: getTodayDateString(),
				checkTime: getCurrentTimeString(),
				isPresent,
				observation: observation.trim() || undefined,
			});

			const created = res.data.data;
			onCheckComplete(assignment.courseClassroomId, {
				id: created.id,
				isPresent: created.isPresent,
				checkTime: created.checkTime,
				observation: created.observation ?? null,
			});
			onClose();
		} catch {
			// ya se notifica globalmente vía React Query.
		}
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2 sm:min-w-md">
				<h1 className="text-xl font-bold text-slate-800 mb-1">
					Registrar verificación
				</h1>
				<p className="text-xs text-gray-500 mb-5">
					Confirma si el docente se encuentra presente en el aula.
				</p>

				<dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-gray-50 p-3 text-sm">
					<div>
						<dt className="text-xs text-muted-foreground">Aula</dt>
						<dd className="font-medium text-foreground">
							{classroomName}
						</dd>
					</div>
					<div>
						<dt className="text-xs text-muted-foreground">
							Edificio
						</dt>
						<dd className="font-medium text-foreground">
							{buildingName}
						</dd>
					</div>
					<div>
						<dt className="text-xs text-muted-foreground">
							Docente
						</dt>
						<dd className="font-medium text-foreground">
							{assignment.teacher.name}
						</dd>
					</div>
					<div>
						<dt className="text-xs text-muted-foreground">
							Sección
						</dt>
						<dd className="font-medium text-foreground">
							{assignment.groupCode}
						</dd>
					</div>
					<div className="col-span-2">
						<dt className="text-xs text-muted-foreground">
							Horario
						</dt>
						<dd className="font-medium text-foreground">
							{formatDays(assignment.days)}
							{startTime ? ` · ${startTime}` : ''}
						</dd>
					</div>
				</dl>

				<form onSubmit={handleSubmit} className="space-y-5">
					<div>
						<label className="mb-2 block text-sm font-semibold text-gray-700">
							¿El docente está presente?
						</label>
						<div className="grid grid-cols-2 gap-3">
							<label
								className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 py-4 text-sm font-semibold transition-colors ${
									isPresent === true
										? 'border-green-500 bg-green-50 text-green-700'
										: 'border-gray-200 text-gray-500 hover:border-gray-300'
								}`}
							>
								<input
									type="radio"
									name="isPresent"
									className="sr-only"
									checked={isPresent === true}
									onChange={() => setIsPresent(true)}
								/>
								Presente
							</label>
							<label
								className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 py-4 text-sm font-semibold transition-colors ${
									isPresent === false
										? 'border-red-500 bg-red-50 text-red-700'
										: 'border-gray-200 text-gray-500 hover:border-gray-300'
								}`}
							>
								<input
									type="radio"
									name="isPresent"
									className="sr-only"
									checked={isPresent === false}
									onChange={() => setIsPresent(false)}
								/>
								Ausente
							</label>
						</div>
					</div>

					<div>
						<label className="mb-2 block text-sm font-semibold text-gray-700">
							Observaciones (opcional)
						</label>
						<textarea
							value={observation}
							onChange={e => setObservation(e.target.value)}
							placeholder="Ej. El docente llegó 10 minutos tarde."
							rows={3}
							className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-green-200"
							disabled={isPendingCreateCheck}
						/>
					</div>

					<div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPendingCreateCheck}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={
								isPresent === null || isPendingCreateCheck
							}
						>
							{isPendingCreateCheck ? 'Guardando...' : 'Guardar'}
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
