import { Check, X } from 'lucide-react';

interface CheckPresenceFieldsProps {
	isPresent: boolean | null;
	onIsPresentChange: (isPresent: boolean) => void;
	observation: string;
	onObservationChange: (observation: string) => void;
	disabled?: boolean;
}

export const CheckPresenceFields = ({
	isPresent,
	onIsPresentChange,
	observation,
	onObservationChange,
	disabled = false,
}: CheckPresenceFieldsProps) => (
	<>
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
						onChange={() => onIsPresentChange(true)}
						disabled={disabled}
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
						onChange={() => onIsPresentChange(false)}
						disabled={disabled}
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
				onChange={e => onObservationChange(e.target.value)}
				placeholder="Ej. El docente llegó 10 minutos tarde."
				rows={3}
				className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-primary/20"
				disabled={disabled}
			/>
		</div>
	</>
);
