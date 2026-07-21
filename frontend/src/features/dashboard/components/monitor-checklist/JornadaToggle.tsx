import { Button } from '@shared/components';
import { JORNADA_LABELS, TJornada } from './checklist.utils';

interface JornadaToggleProps {
	value: TJornada;
	onChange: (jornada: TJornada) => void;
}

const JORNADAS: TJornada[] = ['MORNING', 'AFTERNOON'];

export const JornadaToggle = ({ value, onChange }: JornadaToggleProps) => {
	return (
		<div className="flex gap-2">
			{JORNADAS.map(jornada => (
				<Button
					key={jornada}
					type="button"
					size="sm"
					variant={value === jornada ? 'default' : 'outline'}
					onClick={() => onChange(jornada)}
				>
					{JORNADA_LABELS[jornada]}
				</Button>
			))}
		</div>
	);
};
