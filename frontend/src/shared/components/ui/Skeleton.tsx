import { cn } from '@config/lib';

const shimmerClasses = 'animate-shimmer bg-gradient-to-r from-transparent via-primary/20 to-transparent bg-[length:200%_100%]';

export function Skeleton({
	className,
}: {
	className?: string;
}) {
	return (
		<div
			className={cn(
				'rounded-md bg-muted',
				shimmerClasses,
				className
			)}
		/>
	);
}

export function SkeletonText({
	lines = 1,
	className,
}: {
	lines?: number;
	className?: string;
}) {
	return (
		<div className={cn('space-y-2', className)}>
			{[...Array(lines)].map((_, i) => (
				<Skeleton
					key={i}
					className={cn(
						'h-4',
						i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
					)}
				/>
			))}
		</div>
	);
}

export function SkeletonCircle({
	size = 'md',
	className,
}: {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
}) {
	const sizeClasses = {
		sm: 'size-8',
		md: 'size-12',
		lg: 'size-16',
		xl: 'size-24',
	};

	return (
		<Skeleton
			className={cn(
				'rounded-full',
				sizeClasses[size],
				className
			)}
		/>
	);
}

export function SkeletonButton({
	width = 'w-24',
	className,
}: {
	width?: string;
	className?: string;
}) {
	return (
		<Skeleton
			className={cn(
				'h-9 rounded-md',
				width,
				className
			)}
		/>
	);
}

export function SkeletonBadge({
	className,
}: {
	className?: string;
}) {
	return (
		<Skeleton
			className={cn(
				'h-5 w-16 rounded-full',
				className
			)}
		/>
	);
}

export function SkeletonInput({
	className,
}: {
	className?: string;
}) {
	return (
		<Skeleton
			className={cn(
				'h-10 w-full rounded-md',
				className
			)}
		/>
	);
}

export function SkeletonTable({
	columns = 5,
	rows = 5,
	showHeader = true,
}: {
	columns?: number;
	rows?: number;
	showHeader?: boolean;
}) {
	return (
		<div className="space-y-3">
			{showHeader && (
				<div className="flex gap-3">
					{[...Array(columns)].map((_, i) => (
						<Skeleton
							key={`header-${i}`}
							className="h-9 flex-1 rounded-t-md"
						/>
					))}
				</div>
			)}
			{[...Array(rows)].map((_, rowIndex) => (
				<div key={`row-${rowIndex}`} className="flex gap-3">
					{[...Array(columns)].map((_, colIndex) => (
						<Skeleton
							key={`cell-${rowIndex}-${colIndex}`}
							className="h-12 flex-1 rounded-md"
						/>
					))}
				</div>
			))}
		</div>
	);
}

export function SkeletonCard({
	fields = 4,
	showNumber = true,
	className,
}: {
	fields?: number;
	showNumber?: boolean;
	className?: string;
}) {
	return (
		<div className={cn('space-y-3 p-4 rounded-xl border border-border/50', className)}>
			{showNumber && (
				<div className="flex justify-between items-center pb-3 border-b border-border/30">
					<Skeleton className="h-4 w-10 rounded" />
					<Skeleton className="h-5 w-8 rounded" />
				</div>
			)}
			<div className="space-y-2">
				{[...Array(fields)].map((_, i) => (
					<div key={`field-${i}`} className="flex justify-between gap-4">
						<Skeleton className="h-4 w-16 rounded" />
						<Skeleton className="h-4 w-24 rounded" />
					</div>
				))}
			</div>
		</div>
	);
}

export function SkeletonProfile({
	showAvatar = true,
	showInfo = true,
}: {
	showAvatar?: boolean;
	showInfo?: boolean;
}) {
	return (
		<div className="flex items-center gap-4 p-4">
			{showAvatar && <SkeletonCircle size="lg" />}
			{showInfo && (
				<div className="space-y-2 flex-1">
					<Skeleton className="h-5 w-32 rounded" />
					<Skeleton className="h-4 w-24 rounded" />
				</div>
			)}
		</div>
	);
}
