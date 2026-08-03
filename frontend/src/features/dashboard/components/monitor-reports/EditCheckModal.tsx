import { useEffect, useState } from 'react';
import { TScheduleComplianceCheckDetail, useUpdateCheckMutation } from '@api/monitor';
import { Button, ModalBase } from '@shared';
import { CheckPresenceFields } from '../monitor-checklist';
import { formatCheckDate } from './monitor-reports.utils';

interface EditCheckModalProps {
	isOpen: boolean;
	onClose: () => void;
	check: TScheduleComplianceCheckDetail | null;
}

export const EditCheckModal = ({ isOpen, onClose, check }: EditCheckModalProps) => {
	const { updateCheck, isPendingUpdateCheck } = useUpdateCheckMutation();
	const [isPresent, setIsPresent] = useState<boolean | null>(null);
	const [observation, setObservation] = useState('');

	useEffect(() => {
		if (isOpen && check) {
			setIsPresent(check.isPresent);
			setObservation(check.observation ?? '');
		}
	}, [isOpen, check]);

	if (!check) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isPresent === null) return;

		try {
			await updateCheck({
				id: check.id,
				isPresent,
				observation: observation.trim(),
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
						<dt className="text-xs text-muted-foreground">Asignatura</dt>
						<dd className="truncate font-medium text-foreground">
							{check.courseClassroom.course.name}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">Docente</dt>
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
						<dt className="text-xs text-muted-foreground">Edificio</dt>
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
							disabled={isPresent === null || isPendingUpdateCheck}
						>
							{isPendingUpdateCheck ? 'Guardando...' : 'Guardar cambios'}
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
