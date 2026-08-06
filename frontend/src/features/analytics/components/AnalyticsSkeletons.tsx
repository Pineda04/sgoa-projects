import {
	Skeleton,
	SkeletonCard,
	SkeletonInput,
	SkeletonTable,
} from '@shared/components';

interface AnalyticsSummarySkeletonProps {
	count: number;
	gridClassName?: string;
	showDistribution?: boolean;
}

export const AnalyticsSummarySkeleton = ({
	count,
	gridClassName = 'sm:grid-cols-2 lg:grid-cols-3',
	showDistribution = false,
}: AnalyticsSummarySkeletonProps) => (
	<div aria-busy="true" aria-label="Cargando indicadores">
		<div className={`grid gap-4 ${gridClassName}`}>
			{Array.from({ length: count }, (_, index) => (
				<SkeletonCard
					key={index}
					fields={2}
					showNumber={false}
					className="h-36 bg-card"
				/>
			))}
		</div>
		{showDistribution ? (
			<div className="mt-8 space-y-5 rounded-xl border border-card-border p-4 sm:p-5">
				<div className="flex items-center justify-between gap-4">
					<div className="space-y-2">
						<Skeleton className="h-5 w-52" />
						<Skeleton className="h-4 w-72 max-w-full" />
					</div>
					<Skeleton className="h-8 w-24 rounded-full" />
				</div>
				<div className="grid gap-3 sm:grid-cols-3">
					<Skeleton className="h-20 rounded-lg" />
					<Skeleton className="h-20 rounded-lg" />
					<Skeleton className="h-20 rounded-lg" />
				</div>
			</div>
		) : null}
	</div>
);

export const AnalyticsPageSkeleton = () => (
	<div
		className="space-y-6"
		aria-busy="true"
		aria-label="Cargando analíticas"
	>
		<div className="flex gap-2 overflow-hidden rounded-2xl border border-card-border bg-card p-2 shadow-card">
			{Array.from({ length: 6 }, (_, index) => (
				<Skeleton
					key={index}
					className="h-10 w-28 shrink-0 rounded-xl"
				/>
			))}
		</div>
		<div className="rounded-2xl border border-card-border bg-card p-4 shadow-card sm:p-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }, (_, index) => (
					<SkeletonInput key={index} className="h-16 rounded-lg" />
				))}
			</div>
		</div>
		<div className="rounded-2xl border border-card-border bg-card p-4 shadow-card sm:p-6">
			<div className="mb-5 space-y-2">
				<Skeleton className="h-6 w-48" />
				<Skeleton className="h-4 w-96 max-w-full" />
			</div>
			<AnalyticsSummarySkeleton count={6} />
			<div className="mt-8 border-t border-border pt-6">
				<SkeletonTable columns={5} rows={4} />
			</div>
		</div>
	</div>
);
