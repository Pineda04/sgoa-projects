import { useEffect, useState } from 'react';
import {
	type DigitalBlackboardUseStatus,
	TScheduleComplianceCheckDetail,
	useUpdateCheckMutation,
} from '@api/monitor';
import { Button, ModalBase } from '@shared';
import { CheckPresenceFields } from '../monitor-checklist';
import {
	BLACKBOARD_USE_OPTIONS,
	formatCheckDate,
} from './monitor-reports.utils';

interface EditCheckModalProps {
	isOpen: boolean;
	onClose: () => void;
	check: TScheduleComplianceCheckDetail | null;
}

export const EditCheckModal = ({
	isOpen,
	onClose,
	check,
}: EditCheckModalProps) => {
	const { updateCheck, isPendingUpdateCheck } = useUpdateCheckMutation();
	const [isPresent, setIsPresent] = useState<boolean | null>(null);
	const [observation, setObservation] = useState('');
	const [blackboardUse, setBlackboardUse] =
		useState<DigitalBlackboardUseStatus | null>(null);

	useEffect(() => {
		if (isOpen && check) {
			setIsPresent(check.isPresent);
			setObservation(check.observation ?? '');
			setBlackboardUse(check.digitalBlackboardUseStatus);
		}
	}, [isOpen, check]);

	if (!check) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			isPresent === null ||
			(isPresent &&
				check.courseClassroom.classroom.hasDigitalBlackboard &&
				!blackboardUse)
		)
			return;

		try {
			await updateCheck({
				id: check.id,
				isPresent,
				observation: observation.trim(),
				digitalBlackboardUseStatus:
					isPresent &&
					check.courseClassroom.classroom.hasDigitalBlackboard
						? (blackboardUse ?? undefined)
						: undefined,
			});
			onClose();
		} catch {
			// El error ya se notifica globalmente
		}
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="sm:min-w-md">
				<h1 className="mb-1 text-lg font-bold text-foreground sm:text-xl">
					Editar verificación
				</h1>
				<p className="mb-4 text-xs text-muted-foreground">
					Corrige la información registrada para esta verificación.
				</p>

				<dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-muted p-3 text-sm">
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">
							Asignatura
						</dt>
						<dd className="truncate font-medium text-foreground">
							{check.courseClassroom.course.name}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">
							Docente
						</dt>
						<dd className="truncate font-medium text-foreground">
							{check.courseClassroom.teacher.name}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">Aula</dt>
						<dd className="truncate font-medium text-foreground">
							{check.courseClassroom.classroom.name}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">
							Edificio
						</dt>
						<dd className="truncate font-medium text-foreground">
							{check.courseClassroom.classroom.building.name}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">Fecha</dt>
						<dd className="truncate font-medium text-foreground">
							{formatCheckDate(check.checkDate)}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">Hora</dt>
						<dd className="truncate font-medium text-foreground">
							{check.checkTime}
						</dd>
					</div>
				</dl>

				<form onSubmit={handleSubmit} className="space-y-5">
					<CheckPresenceFields
						isPresent={isPresent}
						onIsPresentChange={setIsPresent}
						observation={observation}
						onObservationChange={setObservation}
						disabled={isPendingUpdateCheck}
					/>

					{isPresent &&
					check.courseClassroom.classroom.hasDigitalBlackboard ? (
						<fieldset>
							<legend className="mb-2 text-sm font-semibold text-foreground">
								¿Se utilizó la pizarra digital?
							</legend>
							<div className="grid gap-2 sm:grid-cols-3">
								{BLACKBOARD_USE_OPTIONS.map(
									({ value, label }) => (
										<label
											key={value}
											className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${blackboardUse === value ? 'border-primary bg-primary-light text-primary' : 'border-border text-muted-foreground'}`}
										>
											<input
												type="radio"
												name="reportBlackboardUse"
												className="sr-only"
												checked={
													blackboardUse === value
												}
												onChange={() =>
													setBlackboardUse(value)
												}
											/>
											{label}
										</label>
									)
								)}
							</div>
						</fieldset>
					) : null}

					<div className="mt-4 flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isPendingUpdateCheck}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={
								isPresent === null ||
								(isPresent &&
									check.courseClassroom.classroom
										.hasDigitalBlackboard &&
									!blackboardUse) ||
								isPendingUpdateCheck
							}
						>
							{isPendingUpdateCheck
								? 'Guardando...'
								: 'Guardar cambios'}
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
