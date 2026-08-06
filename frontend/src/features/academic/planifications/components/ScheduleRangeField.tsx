import { useId } from 'react';
import { createScheduleRange, parseScheduleRange } from '@shared/utils';
import { TIME_OPTIONS } from '../utils';

interface ScheduleRangeFieldProps {
	value: string;
	onChange: (value: string) => void;
	onBlur: () => void;
}

export const ScheduleRangeField = ({
	value,
	onChange,
	onBlur,
}: ScheduleRangeFieldProps) => {
	const fieldId = useId();
	const startId = `${fieldId}-start`;
	const endId = `${fieldId}-end`;
	const { startTime, endTime } = parseScheduleRange(value);
	const startOptions = startTime
		? [...new Set([...TIME_OPTIONS, startTime])].sort()
		: TIME_OPTIONS;
	const endOptions = endTime
		? [...new Set([...TIME_OPTIONS, endTime])].sort()
		: TIME_OPTIONS;
	const selectClassName =
		'cursor-pointer w-full rounded border border-input bg-background px-2 py-1.5 text-foreground outline-none transition hover:border-border-strong focus:ring-2 focus:ring-ring/20';

	return (
		<div className="grid grid-cols-2 gap-2">
			<div>
				<label
					htmlFor={startId}
					className="mb-1 block text-xs text-muted-foreground"
				>
					Inicio
				</label>
				<select
					id={startId}
					value={startTime}
					onChange={event =>
						onChange(
							createScheduleRange(event.target.value, endTime)
						)
					}
					onBlur={onBlur}
					className={selectClassName}
				>
					<option value="">Seleccione...</option>
					{startOptions.map(time => (
						<option key={time} value={time}>
							{time}
						</option>
					))}
				</select>
			</div>
			<div>
				<label
					htmlFor={endId}
					className="mb-1 block text-xs text-muted-foreground"
				>
					Fin
				</label>
				<select
					id={endId}
					value={endTime}
					onChange={event =>
						onChange(
							createScheduleRange(startTime, event.target.value)
						)
					}
					onBlur={onBlur}
					className={selectClassName}
				>
					<option value="">Seleccione...</option>
					{endOptions.map(time => (
						<option key={time} value={time}>
							{time}
						</option>
					))}
				</select>
			</div>
		</div>
	);
};
