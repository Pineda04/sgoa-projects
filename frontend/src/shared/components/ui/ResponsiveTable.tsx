import type { ReactNode } from 'react';
import { SkeletonTable, SkeletonCard } from './Skeleton';

export interface IResponsiveColumn<T> {
	key: string;
	header: string;
	mobileLabel?: string;
	render?: (row: T, index: number) => ReactNode;
	className?: string;
	headerClassName?: string;
	hiddenOnMobile?: boolean;
	sticky?: 'left' | 'right';
}

export interface IResponsiveTableProps<T> {
	columns: IResponsiveColumn<T>[];
	data: T[];
	getRowKey: (row: T) => string | number;
	loading?: boolean;
	emptyMessage?: string;
	onRowClick?: (row: T) => void;
	className?: string;
	showRowNumber?: boolean;
	rowClassName?: (row: T, index: number) => string;
}

function getNestedValue<T>(obj: T, path: string): unknown {
	return path.split('.').reduce((acc: unknown, part) => {
		if (acc && typeof acc === 'object') {
			return (acc as Record<string, unknown>)[part];
		}
		return undefined;
	}, obj);
}

export function ResponsiveTable<T>({
	columns,
	data,
	getRowKey,
	loading,
	emptyMessage = 'No hay datos disponibles',
	onRowClick,
	className = 'w-full',
	showRowNumber = false,
	rowClassName,
}: IResponsiveTableProps<T>) {
	if (loading) {
		return (
			<div className="overflow-x-auto rounded-lg shadow-md p-4">
				<div className="hidden md:block">
					<SkeletonTable columns={columns.length} rows={5} />
				</div>
				<div className="md:hidden">
					<SkeletonCard
						fields={columns.filter(c => !c.hiddenOnMobile).length}
						showNumber={showRowNumber}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className={`overflow-x-auto rounded-lg shadow-md ${className}`}>
			<table className="w-full hidden md:table">
				<thead className="bg-primary text-primary-foreground">
					<tr className="first:rounded-tl-lg last:rounded-tr-lg">
						{showRowNumber && (
							<th className="py-3 px-4 text-center font-semibold text-sm w-16 first:rounded-tl-lg">
								#
							</th>
						)}
						{columns.map((col, i) => (
							<th
								key={col.key}
								className={`py-3 px-4 text-center font-semibold text-sm ${col.headerClassName || ''} ${i === columns.length - 1 && showRowNumber ? 'last:rounded-tr-lg' : ''} ${i === columns.length - 1 && !showRowNumber ? 'last:rounded-tr-lg' : ''} ${col.sticky === 'right' ? 'sticky right-0 z-20 bg-primary' : ''} ${col.sticky === 'left' ? 'sticky left-0 z-20 bg-primary' : ''}`}
							>
								{col.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="text-center text-sm text-foreground">
					{data.length === 0 ? (
						<tr>
							<td
								colSpan={
									columns.length + (showRowNumber ? 1 : 0)
								}
								className="py-8 text-muted-foreground"
							>
								{emptyMessage}
							</td>
						</tr>
					) : (
						data.map((row, index) => (
							<tr
								key={getRowKey(row)}
								className={`
                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
                  hover:bg-primary-light transition-colors duration-150
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${rowClassName ? rowClassName(row, index) : ''}
                `}
								onClick={() => onRowClick?.(row)}
							>
								{showRowNumber && (
									<td className="py-3 px-4 border-t border-border">
										{index + 1}
									</td>
								)}
								{columns.map(col => (
									<td
										key={col.key}
										className={`py-3 px-4 border-t border-border ${col.className || ''} ${col.sticky === 'right' ? 'sticky right-0 z-10 ' + (index % 2 === 0 ? 'bg-card' : 'bg-muted') : ''} ${col.sticky === 'left' ? 'sticky left-0 z-10 ' + (index % 2 === 0 ? 'bg-card' : 'bg-muted') : ''}`}
									>
										{col.render
											? col.render(row, index)
											: (getNestedValue(
													row,
													col.key
												) as ReactNode)}
									</td>
								))}
							</tr>
						))
					)}
				</tbody>
			</table>

			<div className="min-w-0 space-y-3 md:hidden">
				{data.length === 0 ? (
					<div className="bg-card border border-card-border rounded-xl p-8 text-center text-muted-foreground">
						{emptyMessage}
					</div>
				) : (
					data.map((row, index) => (
						<div
							key={getRowKey(row)}
							className={`
								bg-card border border-card-border rounded-xl p-4
								shadow-sm hover:shadow-md transition-all duration-200
								${onRowClick ? 'cursor-pointer hover:border-primary/30' : ''}
								${rowClassName ? rowClassName(row, index) : ''}
							`}
							onClick={() => onRowClick?.(row)}
							style={{
								animationDelay: `${index * 50}ms`,
							}}
						>
							{showRowNumber && (
								<div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
									<span className="text-xs font-medium text-muted-foreground">
										#
									</span>
									<span className="font-semibold text-primary">
										{index + 1}
									</span>
								</div>
							)}
							<dl className="min-w-0 space-y-2">
								{columns
									.filter(col => !col.hiddenOnMobile)
									.map(col => (
										<div
											key={col.key}
											className="grid min-w-0 grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-start gap-2"
										>
											<dt className="text-xs text-muted-foreground shrink-0">
												{col.mobileLabel || col.header}
											</dt>
											<dd className="min-w-0 break-words text-right text-sm font-medium text-foreground [overflow-wrap:anywhere]">
												{col.render
													? col.render(row, index)
													: String(
															getNestedValue(
																row,
																col.key
															) ?? '-'
														)}
											</dd>
										</div>
									))}
							</dl>
						</div>
					))
				)}
			</div>
		</div>
	);
}
