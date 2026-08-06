import { useMemo, useState, useEffect } from 'react';
import { useAbility } from '@config';
import { usePaginationParams, useDebounce } from '@shared/hooks';
import {
	useGetCurrentAcademicPeriod,
	useGetAcademicPeriods,
} from '@api/periods';
import { useGetAllMyCoordinations } from '@api/teachers';
import { useGetAllDepartments } from '@api/departments';
import { useGetConsolidated } from '@api/courses';
import {
	DataTable,
	Pagination,
	SkeletonTable,
} from '@shared/components';
import { TOutputConsolidated } from '@api/courses/courses.types';

interface Props {
	centerDepartmentId?: string;
	showDepartmentFilter?: boolean;
}

const columns = [
	{
		key: 'courseCode',
		header: 'Código',
		mobileLabel: 'Código',
	},
	{
		key: 'courseName',
		header: 'Asignatura',
		mobileLabel: 'Asig.',
	},
	{
		key: 'section',
		header: 'Sección',
		mobileLabel: 'Sec.',
	},
	{
		key: 'initial',
		header: 'Matrícula Inicial',
		mobileLabel: 'Inicial',
		render: (row: TOutputConsolidated) =>
			row.initial ?? 'Sin información',
	},
	{
		key: 'final',
		header: 'Matrícula Final',
		mobileLabel: 'Final',
	},
	{
		key: 'teacherName',
		header: 'Docente',
		mobileLabel: 'Docente',
	},
	{
		key: 'modality',
		header: 'Modalidad',
		mobileLabel: 'Modalidad',
	},
	{
		key: 'indexABD',
		header: '% ABD',
		mobileLabel: '% ABD',
		render: (row: TOutputConsolidated) =>
			row.indexABD === null
				? 'Sin información'
				: `${row.indexABD.toFixed(2)}%`,
	},
	{
		key: 'indexNSP',
		header: '% NSP',
		mobileLabel: '% NSP',
		render: (row: TOutputConsolidated) =>
			row.indexNSP === null
				? 'Sin información'
				: `${row.indexNSP.toFixed(2)}%`,
	},
	{
		key: 'indexRPB',
		header: '% RPB',
		mobileLabel: '% RPB',
		render: (row: TOutputConsolidated) =>
			row.indexRPB === null
				? 'Sin información'
				: `${row.indexRPB.toFixed(2)}%`,
	},
	{
		key: 'indexAPB',
		header: '% APB',
		mobileLabel: '% APB',
		render: (row: TOutputConsolidated) =>
			row.indexAPB === null
				? 'Sin información'
				: `${row.indexAPB.toFixed(2)}%`,
	},
];

export const Consolidated = ({
	centerDepartmentId: propCenterDepartmentId,
	showDepartmentFilter = false,
}: Props = {}) => {
	const ability = useAbility();
	const isAdminOrDireccion = ability.can('manage', 'dashboard-authorities');
	const isCoord = ability.can('manage', 'dashboard-coordinator');

	const { page, size, setPage } = usePaginationParams();
	const { data: currentPeriod } = useGetCurrentAcademicPeriod();
	const { data: periods } = useGetAcademicPeriods();
	const { data: coordinations, isLoading: isLoadingCoordinations } =
		useGetAllMyCoordinations({ enabled: isCoord });

	const { data: allDepartments } = useGetAllDepartments();

	const [selectedYear, setSelectedYear] = useState('');
	const [selectedPac, setSelectedPac] = useState('');
	const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const { debouncedValue: debouncedSearch } = useDebounce(searchTerm, 500);

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
			searchTerm: debouncedSearch || undefined,
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
			<div className="pb-4 grid items-end grid-cols-1 md:grid-cols-4 gap-4">
				<div className={`md:col-span-4 grid grid-cols-1 ${showDepartmentFilter ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-4`}>
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							Buscar Clase o Docente
						</label>
						<input
							type="text"
							placeholder="Nombre de clase o docente..."
							value={searchTerm}
							onChange={e => {
								setSearchTerm(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						/>
					</div>
					{showDepartmentFilter && (
						<div>
							<label className="block mb-2 font-semibold text-sm text-foreground">
								Departamento
							</label>
							<select
								value={selectedDepartmentId}
								onChange={e => {
									setSelectedDepartmentId(e.target.value);
									setPage(1);
								}}
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
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							Año
						</label>
						<select
							value={selectedYear}
							onChange={e => {
								setSelectedYear(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						>
							{years.map(y => (
								<option key={y} value={y}>
									{y}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							PAC
						</label>
						<select
							value={selectedPac}
							onChange={e => {
								setSelectedPac(e.target.value);
								setPage(1);
							}}
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
			</div>

			<div className="w-full overflow-x-auto pb-10">
				{consolidatedQuery.isLoading ? (
					<div className="rounded-xl bg-white p-6 shadow-md">
						<SkeletonTable columns={11} rows={5} />
					</div>
				) : (
					<>
						<DataTable
							columns={columns}
							data={data ?? []}
							getRowKey={row =>
								`${row.year}-${row.pac}-${row.department}-${row.teacherCode}-${row.courseCode}-${row.section}-${row.modality}`
							}
							showRowNumber={false}
							emptyMessage={
								isCoordWithoutCoordination
									? 'No tiene coordinaciones asignadas.'
									: 'No hay datos de rendimiento académico para los filtros seleccionados'
							}
						/>
						<Pagination totalPages={meta?.lastPage ?? 0} />
					</>
				)}
			</div>
		</div>
	);
};
