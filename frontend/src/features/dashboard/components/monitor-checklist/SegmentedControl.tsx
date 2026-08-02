import type { ReactNode } from 'react';

export interface TSegmentedOption<T extends string> {
	value: T;
	label: ReactNode;
	title?: string;
	ariaLabel?: string;
	badge?: number;
}

interface SegmentedControlProps<T extends string> {
	options: TSegmentedOption<T>[];
	value: T;
	onChange: (value: T) => void;
	ariaLabel: string;
	className?: string;
	fullWidth?: boolean;
}

export const SegmentedControl = <T extends string>({
	options,
	value,
	onChange,
	ariaLabel,
	className = '',
	fullWidth = false,
}: SegmentedControlProps<T>) => (
	<div
		role="group"
		aria-label={ariaLabel}
		className={`inline-flex gap-1 rounded-lg border border-border bg-muted/50 p-1 ${
			fullWidth ? 'w-full' : ''
		} ${className}`}
	>
		{options.map(option => {
			const isSelected = option.value === value;

			return (
				<button
					key={option.value}
					type="button"
					onClick={() => onChange(option.value)}
					aria-pressed={isSelected}
					aria-label={option.ariaLabel}
					title={option.title}
					className={`flex min-h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none ${
						isSelected
							? 'bg-card text-foreground shadow-sm'
							: 'text-muted-foreground hover:text-foreground'
					}`}
				>
					{option.label}
					{option.badge !== undefined && option.badge > 0 && (
						<span
							className={`rounded-full px-1.5 text-xs font-semibold tabular-nums ${
								isSelected
									? 'bg-primary/10 text-primary'
									: 'bg-muted-foreground/15'
							}`}
						>
							{option.badge}
						</span>
					)}
				</button>
			);
		})}
	</div>
);
