import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button, ModalBase } from '@shared';
import { TChecklistItem } from './checklist.utils';

interface CheckModalProps {
	isOpen: boolean;
	onClose: () => void;
	item: TChecklistItem | null;
	isSubmitting: boolean;
	onSubmit: (isPresent: boolean, observation: string) => Promise<boolean>;
}

export const CheckModal = ({
	isOpen,
	onClose,
	item,
	isSubmitting,
	onSubmit,
}: CheckModalProps) => {
	const [isPresent, setIsPresent] = useState<boolean | null>(null);
	const [observation, setObservation] = useState('');

	useEffect(() => {
		if (isOpen) {
			setIsPresent(null);
			setObservation('');
		}
	}, [isOpen, item?.id]);

	if (!item) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isPresent === null) return;

		const wasRegistered = await onSubmit(isPresent, observation);
		if (wasRegistered) onClose();
	};

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="sm:min-w-md">
				<h1 className="mb-1 text-lg font-bold text-foreground sm:text-xl">
					Registrar verificación
				</h1>
				<p className="mb-4 text-xs text-muted-foreground">
					Confirma si el docente se encuentra presente en el aula.
				</p>

				<dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-muted p-3 text-sm">
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">Asignatura</dt>
						<dd className="truncate font-medium text-foreground">
							{item.assignment.courseName}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">Docente</dt>
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
						<dt className="text-xs text-muted-foreground">Edificio</dt>
						<dd className="truncate font-medium text-foreground">
							{item.buildingName}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">Sección</dt>
						<dd className="truncate font-medium text-foreground">
							{item.assignment.groupCode}
						</dd>
					</div>
					<div className="min-w-0">
						<dt className="text-xs text-muted-foreground">Horario</dt>
						<dd className="truncate font-medium text-foreground">
							{item.schedule}
						</dd>
					</div>
				</dl>

				<form onSubmit={handleSubmit} className="space-y-5">
					<fieldset>
						<legend className="mb-2 text-sm font-semibold text-foreground">
							¿El docente está presente?
						</legend>
						<div className="grid grid-cols-2 gap-3">
							<label
								className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 py-4 text-sm font-semibold transition-colors ${
									isPresent === true
										? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300'
										: 'border-border text-muted-foreground hover:border-border-strong'
								}`}
							>
								<input
									type="radio"
									name="isPresent"
									className="sr-only"
									checked={isPresent === true}
									onChange={() => setIsPresent(true)}
								/>
								<Check className="size-4" />
								Presente
							</label>
							<label
								className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 py-4 text-sm font-semibold transition-colors ${
									isPresent === false
										? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
										: 'border-border text-muted-foreground hover:border-border-strong'
								}`}
							>
								<input
									type="radio"
									name="isPresent"
									className="sr-only"
									checked={isPresent === false}
									onChange={() => setIsPresent(false)}
								/>
								<X className="size-4" />
								Ausente
							</label>
						</div>
					</fieldset>

					<div>
						<label
							htmlFor="check-observation"
							className="mb-2 block text-sm font-semibold text-foreground"
						>
							Observaciones (opcional)
						</label>
						<textarea
							id="check-observation"
							value={observation}
							onChange={e => setObservation(e.target.value)}
							placeholder="Ej. El docente llegó 10 minutos tarde."
							rows={3}
							className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20"
							disabled={isSubmitting}
						/>
					</div>

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
							disabled={isPresent === null || isSubmitting}
						>
							{isSubmitting ? 'Guardando...' : 'Guardar'}
						</Button>
					</div>
				</form>
			</div>
		</ModalBase>
	);
};
