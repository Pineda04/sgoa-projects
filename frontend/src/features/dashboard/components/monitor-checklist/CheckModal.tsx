import { useEffect, useState } from 'react';
import { Button, ModalBase } from '@shared';
import type { DigitalBlackboardUseStatus } from '@api/monitor';
import { CheckPresenceFields } from './CheckPresenceFields';
import { TChecklistItem } from './checklist.utils';

type TCheckModalMode = 'create' | 'edit';

interface CheckModalProps {
	isOpen: boolean;
	onClose: () => void;
	item: TChecklistItem | null;
	mode?: TCheckModalMode;
	isSubmitting: boolean;
	onSubmit: (
		isPresent: boolean,
		observation: string,
		digitalBlackboardUseStatus?: DigitalBlackboardUseStatus
	) => Promise<boolean>;
}

const BLACKBOARD_USE_OPTIONS: ReadonlyArray<{
	value: DigitalBlackboardUseStatus;
	label: string;
}> = [
	{ value: 'USED', label: 'Usada' },
	{ value: 'NOT_USED', label: 'No usada' },
	{ value: 'UNKNOWN', label: 'No se pudo determinar' },
];

export const CheckModal = ({
	isOpen,
	onClose,
	item,
	mode = 'create',
	isSubmitting,
	onSubmit,
}: CheckModalProps) => {
	const [isPresent, setIsPresent] = useState<boolean | null>(null);
	const [observation, setObservation] = useState('');
	const [blackboardUse, setBlackboardUse] =
		useState<DigitalBlackboardUseStatus | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		if (mode === 'edit' && item?.check) {
			setIsPresent(item.check.isPresent);
			setObservation(item.check.observation ?? '');
			setBlackboardUse(item.check.digitalBlackboardUseStatus ?? null);
		} else {
			setIsPresent(null);
			setObservation('');
			setBlackboardUse(null);
		}
	}, [isOpen, item?.id, item?.check, mode]);

	if (!item) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			isPresent === null ||
			(isPresent &&
				item.assignment.hasDigitalBlackboard &&
				!blackboardUse)
		)
			return;

		const wasRegistered = await onSubmit(
			isPresent,
			observation,
			isPresent && item.assignment.hasDigitalBlackboard
				? (blackboardUse ?? undefined)
				: undefined
		);
		if (wasRegistered) onClose();
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="sm:min-w-md">
				<h1 className="mb-1 text-lg font-bold text-foreground sm:text-xl">
					{mode === 'edit'
						? 'Editar verificación'
						: 'Registrar verificación'}
				</h1>
				<p className="mb-4 text-xs text-muted-foreground">
					{mode === 'edit'
						? 'Corrige la información registrada para esta verificación.'
						: 'Confirma si el docente se encuentra presente en el aula.'}
				</p>

				<dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-muted p-3 text-sm">
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">
							Asignatura
						</dt>
						<dd className="truncate font-medium text-foreground">
							{item.assignment.courseName}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">
							Docente
						</dt>
						<dd className="truncate font-medium text-foreground">
							{item.assignment.teacher.name}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">Aula</dt>
						<dd className="truncate font-medium text-foreground">
							{item.classroomName}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">
							Edificio
						</dt>
						<dd className="truncate font-medium text-foreground">
							{item.buildingName}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">
							Sección
						</dt>
						<dd className="truncate font-medium text-foreground">
							{item.assignment.groupCode}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">
							Horario
						</dt>
						<dd className="truncate font-medium text-foreground">
							{item.schedule}
						</dd>
					</div>
				</dl>

				<form onSubmit={handleSubmit} className="space-y-5">
					<CheckPresenceFields
						isPresent={isPresent}
						onIsPresentChange={setIsPresent}
						observation={observation}
						onObservationChange={setObservation}
						disabled={isSubmitting}
					/>

					{isPresent && item.assignment.hasDigitalBlackboard ? (
						<fieldset>
							<legend className="mb-2 text-sm font-semibold text-foreground">
								¿Se utilizó la pizarra digital?
							</legend>
							<div className="grid gap-2 sm:grid-cols-3">
								{BLACKBOARD_USE_OPTIONS.map(option => (
									<label
										key={option.value}
										className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${blackboardUse === option.value ? 'border-primary bg-primary-light text-primary' : 'border-border text-muted-foreground'}`}
									>
										<input
											type="radio"
											name="blackboardUse"
											className="sr-only"
											checked={
												blackboardUse === option.value
											}
											onChange={() =>
												setBlackboardUse(option.value)
											}
										/>
										{option.label}
									</label>
								))}
							</div>
						</fieldset>
					) : null}

					<div className="mt-4 flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSubmitting}
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={
								isPresent === null ||
								(isPresent &&
									item.assignment.hasDigitalBlackboard &&
									!blackboardUse) ||
								isSubmitting
							}
						>
							{isSubmitting
								? 'Guardando...'
								: mode === 'edit'
									? 'Guardar cambios'
									: 'Guardar'}
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
