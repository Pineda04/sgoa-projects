import { useEffect, useState } from 'react';
import { Check, LoaderCircle, NotebookPen, X } from 'lucide-react';
import { Button } from '@shared/components';

const CONFIRM_TIMEOUT_MS = 4000;

interface CheckActionsProps {
	isSubmitting: boolean;
	disabled?: boolean;
	onConfirm: (isPresent: boolean) => void;
	onOpenModal: () => void;
	className?: string;
}

export const CheckActions = ({
	isSubmitting,
	disabled = false,
	onConfirm,
	onOpenModal,
	className = '',
}: CheckActionsProps) => {
	const [confirming, setConfirming] = useState<boolean | null>(null);

	useEffect(() => {
		if (confirming === null) return;

		const timeout = window.setTimeout(
			() => setConfirming(null),
			CONFIRM_TIMEOUT_MS
		);

		return () => window.clearTimeout(timeout);
	}, [confirming]);

	if (isSubmitting) {
		return (
			<div
				className={`flex items-center justify-center gap-2 text-sm text-muted-foreground ${className}`}
				role="status"
			>
				<LoaderCircle className="size-4 animate-spin" />
				Guardando...
			</div>
		);
	}

	if (confirming !== null) {
		return (
			<div className={`flex items-center gap-2 ${className}`}>
				<Button
					type="button"
					size="sm"
					disabled={disabled}
					onClick={() => {
						setConfirming(null);
						onConfirm(confirming);
					}}
					className={`h-11 flex-1 sm:h-9 ${
						confirming
							? 'bg-green-600 text-white hover:bg-green-700'
							: 'bg-red-600 text-white hover:bg-red-700'
					}`}
				>
					<Check className="size-4" />
					Confirmar {confirming ? 'presente' : 'ausente'}
				</Button>
				<Button
					type="button"
					size="sm"
					variant="ghost"
					className="h-11 sm:h-9"
					onClick={() => setConfirming(null)}
				>
					Cancelar
				</Button>
			</div>
		);
	}

	return (
		<div className={`flex items-center gap-2 ${className}`}>
			<Button
				type="button"
				size="sm"
				variant="outline"
				disabled={disabled}
				onClick={() => setConfirming(true)}
				className="h-11 flex-1 border-green-300 text-green-700 hover:border-green-500 hover:bg-green-50 hover:text-green-800 sm:h-9 dark:border-green-500/40 dark:text-green-300 dark:hover:bg-green-500/10"
			>
				<Check className="size-4" />
				Presente
			</Button>
			<Button
				type="button"
				size="sm"
				variant="outline"
				disabled={disabled}
				onClick={() => setConfirming(false)}
				className="h-11 flex-1 border-red-300 text-red-700 hover:border-red-500 hover:bg-red-50 hover:text-red-800 sm:h-9 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10"
			>
				<X className="size-4" />
				Ausente
			</Button>
			<Button
				type="button"
				size="icon-sm"
				variant="ghost"
				disabled={disabled}
				onClick={onOpenModal}
				className="size-11 shrink-0 sm:size-9"
				title="Registrar con observación"
				aria-label="Registrar con observación"
			>
				<NotebookPen className="size-4" />
			</Button>
		</div>
	);
};
