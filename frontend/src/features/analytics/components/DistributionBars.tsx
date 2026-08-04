import type { AnalyticsDistributionItem } from '@api/analytics';

const formatter = new Intl.NumberFormat('es-HN', { maximumFractionDigits: 2 });

export const DistributionBars = ({
	items,
	emptyMessage = 'No hay datos para esta distribución.',
}: {
	items: AnalyticsDistributionItem[];
	emptyMessage?: string;
}) => {
	if (!items.length) {
		return <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
	}
	return (
		<ul className="space-y-4">
			{items.map(item => (
				<li key={item.id}>
					<div className="mb-1.5 flex items-end justify-between gap-3 text-sm">
						<span className="font-medium text-foreground">{item.label}</span>
						<span className="shrink-0 tabular-nums text-muted-foreground">
							{formatter.format(item.value)} · {formatter.format(item.percentage)}%
						</span>
					</div>
					<div className="h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={item.label} aria-valuenow={Math.min(item.percentage, 100)} aria-valuemin={0} aria-valuemax={100}>
						<div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(item.percentage, 100)}%` }} />
					</div>
				</li>
			))}
		</ul>
	);
};
