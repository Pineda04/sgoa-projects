import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@config/providers';
import { EUserRole } from '@shared/constants';
import { useGetConsolidated, type TOutputConsolidated } from '@api/courses';
import { useGetAllDepartments } from '@api/departments';
import { useGetAllMyCoordinations } from '@api/teachers';
import {
	useGetAcademicPeriods,
	useGetCurrentAcademicPeriod,
} from '@api/periods';
import {
	DataTable,
	type IDataTableColumn,
} from '@shared/components/ui/DataTable';
import { Pagination } from '@shared/components/ui/Pagination';
import { SkeletonTable } from '@shared/components/ui/Skeleton';
import { usePaginationParams } from '@shared/hooks';
import { cn } from '@config/lib';
import { TagError } from '@shared/components/ui/TagError';

function formatPercent(value: number): string {
	return `${(value ?? 0).toFixed(2)}%`;
}

function InconsistencyBadge({ value }: { value: string }) {
	const isCorrect = value === 'Correcto';
	return (
		<span
			className={cn(
				'px-2 py-0.5 rounded-full text-xs font-medium',
				isCorrect
					? 'bg-green-100 text-green-800'
					: 'bg-red-100 text-red-800'
			)}
		>
			{value}
		</span>
	);
}

const columns: IDataTableColumn<TOutputConsolidated>[] = [
	{ key: 'courseCode', header: 'Código' },
	{ key: 'courseName', header: 'Asignatura', hiddenOnMobile: true },
	{ key: 'section', header: 'Sección' },
	{ key: 'initial', header: 'Inicio' },
	{ key: 'final', header: 'Final' },
	{ key: 'ABD', header: 'ABD' },
	{ key: 'NSP', header: 'NSP' },
	{ key: 'RPB', header: 'RPB' },
	{ key: 'APB', header: 'APB' },
	{
		key: 'finalSummatoryInconsistency',
		header: 'Inconsistencia Final',
		hiddenOnMobile: true,
		render: row => (
			<InconsistencyBadge value={row.finalSummatoryInconsistency} />
		),
	},
	{
		key: 'initialSummatoryInconsistency',
		header: 'Inconsistencia Inicial',
		hiddenOnMobile: true,
		render: row => (
			<InconsistencyBadge value={row.initialSummatoryInconsistency} />
		),
	},
	{ key: 'teacherCode', header: 'Empleado', hiddenOnMobile: true },
	{ key: 'teacherName', header: 'Nombre', hiddenOnMobile: true },
	{ key: 'department', header: 'Departamento', hiddenOnMobile: true },
	{ key: 'modality', header: 'Modalidad', hiddenOnMobile: true },
	{
		key: 'indexAPB',
		header: 'Índice de aprobación',
		hiddenOnMobile: true,
		render: row => formatPercent(row.indexAPB),
	},
	{
		key: 'indexRPB',
		header: 'Índice de reprobación',
		hiddenOnMobile: true,
		render: row => formatPercent(row.indexRPB),
	},
	{
		key: 'indexABD',
		header: 'Índice de abandono',
		hiddenOnMobile: true,
		render: row => formatPercent(row.indexABD),
	},
	{
		key: 'indexNSP',
		header: 'Índice de NSP',
		hiddenOnMobile: true,
		render: row => formatPercent(row.indexNSP),
	},
	{
		key: 'terminalEfficiency',
		header: 'Eficiencia terminal',
		hiddenOnMobile: true,
		render: row => formatPercent(row.terminalEfficiency),
	},
	{ key: 'pac', header: 'Período' },
	{ key: 'year', header: 'Año' },
];

type Props = {
	centerDepartmentId?: string;
	showDepartmentFilter?: boolean;
};

export const Consolidated = ({
	centerDepartmentId: propCenterDepartmentId,
	showDepartmentFilter = false,
}: Props = {}) => {
	const { authState } = useAuth();
	const roles = authState.user?.roles ?? [];
	const isAdminOrDireccion = roles.some(
		r => r === EUserRole.ADMIN || r === EUserRole.DIRECCION
	);
	const isCoord = roles.includes(EUserRole.COORDINADOR_AREA);

	const { page, size } = usePaginationParams();
	const { data: currentPeriod } = useGetCurrentAcademicPeriod();
	const { data: periods } = useGetAcademicPeriods();
	const { data: coordinations, isLoading: isLoadingCoordinations } =
		useGetAllMyCoordinations({ enabled: isCoord });

	const { data: allDepartments } = useGetAllDepartments();

	const [selectedYear, setSelectedYear] = useState('');
	const [selectedPac, setSelectedPac] = useState('');
	const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

	useEffect(() => {
		if (currentPeriod) {
			setSelectedYear(prev => prev || String(currentPeriod.year));
			setSelectedPac(prev => prev || String(currentPeriod.pac));
		}
	}, [currentPeriod]);

	const years = useMemo(() => {
		if (!periods) return [];
		const uniqueYears = [...new Set(periods.map(p => p.year))];
		return uniqueYears.sort((a, b) => b - a);
	}, [periods]);

	const departmentFilterId = useMemo(() => {
		if (!showDepartmentFilter || !selectedDepartmentId || !allDepartments)
			return undefined;
		const dept = allDepartments.find(d => d.id === selectedDepartmentId);
		return dept?.coordinations?.[0]?.centerDepartmentId ?? undefined;
	}, [showDepartmentFilter, selectedDepartmentId, allDepartments]);

	const centerDepartmentId =
		propCenterDepartmentId ??
		departmentFilterId ??
		(isCoord ? (coordinations?.[0]?.centerDepartmentId ?? '') : undefined);

	const hasUnresolvedDepartmentFilter =
		showDepartmentFilter &&
		Boolean(selectedDepartmentId) &&
		!departmentFilterId;

	const shouldFetch = Boolean(
		selectedYear &&
		selectedPac &&
		!hasUnresolvedDepartmentFilter &&
		(isAdminOrDireccion || (isCoord && Boolean(centerDepartmentId)))
	);

	const consolidatedQuery = useGetConsolidated(
		{
			year: selectedYear || undefined,
			pac: selectedPac || undefined,
			...(centerDepartmentId ? { centerDepartmentId } : {}),
			page,
			size,
		},
		shouldFetch
	);

	const data = consolidatedQuery.data?.data;
	const meta = consolidatedQuery.data?.meta;

	const isCoordWithoutCoordination =
		isCoord &&
		!propCenterDepartmentId &&
		!isLoadingCoordinations &&
		(!coordinations || coordinations.length === 0);

	return (
		<div className="min-h-screen bg-transparent">
			<div className="px-8 pb-4 flex items-center gap-4 flex-wrap">
				{showDepartmentFilter && (
					<div className="flex items-center gap-2">
						<label className="block font-semibold text-sm text-foreground">
							Departamento:
						</label>
						<select
							value={selectedDepartmentId}
							onChange={e =>
								setSelectedDepartmentId(e.target.value)
							}
							className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						>
							<option value="">Todos los departamentos</option>
							{allDepartments?.map(d => (
								<option key={d.id} value={d.id}>
									{d.name}
								</option>
							))}
						</select>
					</div>
				)}
				<div className="flex items-center gap-2">
					<label className="block font-semibold text-sm text-foreground">
						Año:
					</label>
					<select
						value={selectedYear}
						onChange={e => setSelectedYear(e.target.value)}
						className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
					>
						{years.map(y => (
							<option key={y} value={y}>
								{y}
							</option>
						))}
					</select>
				</div>

				<div className="flex items-center gap-2">
					<label className="block font-semibold text-sm text-foreground">
						PAC:
					</label>
					<select
						value={selectedPac}
						onChange={e => setSelectedPac(e.target.value)}
						className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
					>
						{[1, 2, 3].map(p => (
							<option key={p} value={p}>
								{p}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="w-full overflow-x-auto px-4 pb-10">
				{isCoordWithoutCoordination ? (
					<TagError text="No tiene coordinaciones asignadas." />
				) : consolidatedQuery.isLoading ? (
					<div className="rounded-xl bg-white p-6 shadow-md">
						<SkeletonTable columns={20} rows={5} />
					</div>
				) : consolidatedQuery.isError ? (
					<TagError text="No se encontraron datos disponibles." />
				) : !data || data.length === 0 ? (
					<TagError text="No hay datos de rendimiento académico para los filtros seleccionados" />
				) : (
					<>
						<DataTable
							columns={columns}
							data={data}
							getRowKey={row =>
							  `${row.year}-${row.pac}-${row.department}-${row.teacherCode}-${row.courseCode}-${row.section}-${row.modality}`
							}
							showRowNumber
						/>
						<Pagination totalPages={meta?.lastPage ?? 0} />
					</>
				)}
			</div>
		</div>
	);
};
