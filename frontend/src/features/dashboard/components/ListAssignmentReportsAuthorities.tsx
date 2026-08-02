import { useState } from 'react';
import { useGetAllAssignmentReportsForAuthorities } from '@api/assignment-reports';
import { TAssignmentReport } from '@api/assignment-reports';
import { useGetAllDepartments } from '@api/departments';
import { useGetAllCenters } from '@api/centers';
import { Button, IResponsiveColumn, Loading, Pagination, ResponsiveTable } from '@shared/components';
import { EyeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce, usePaginationParams } from '@shared/hooks';
import { useMemo } from 'react';
import { useGetAcademicPeriods } from '@api/periods';

export const ListAssignmentReportsAuthorities = () => {
	const navigate = useNavigate();
	const { setPage } = usePaginationParams();

	const [searchTerm, setSearchTerm] = useState('');
	const { debouncedValue: debouncedSearch } = useDebounce(searchTerm, 500);
	const [yearFilter, setYearFilter] = useState('');
	const [pacFilter, setPacFilter] = useState('');
	const [departmentFilter, setDepartmentFilter] = useState('');
	const [centerFilter, setCenterFilter] = useState('');

	const { data: departments } = useGetAllDepartments();
	const { data: centers } = useGetAllCenters();

	const { data: periods } = useGetAcademicPeriods();

	const years = useMemo(() => {
		if (!periods) return [];
		const uniqueYears = [...new Set(periods.map(p => p.year))];
		return uniqueYears.sort((a, b) => b - a);
	}, [periods]);

	const { isLoading, data } = useGetAllAssignmentReportsForAuthorities(
		yearFilter || undefined,
		pacFilter || undefined,
		departmentFilter || undefined,
		centerFilter || undefined,
		debouncedSearch || undefined
	);

	const reports = (data?.data ?? []) as TAssignmentReport[];

	const handleView = (reportId: string, teacherName: string, teacherCode: string) => {
		navigate(`/academic/reports/coordinator/${reportId}`, {
			state: { teacherName, teacherCode },
		});
	};

	const columns: IResponsiveColumn<TAssignmentReport>[] = [
		{
			key: 'period',
			header: 'Periodo',
			mobileLabel: 'Periodo',
			render: (row: TAssignmentReport) => (
				<span>
					<span className="font-medium text-[#144C74]">{row.period.year}</span>
					{' - '}
					<span className="text-gray-600">
						{row.period.pac_modality} {row.period.pac}
					</span>
				</span>
			),
		},
		{
			key: 'teacher.user.name',
			header: 'Docente',
			mobileLabel: 'Docente',
		},
		{
			key: 'teacher.user.code',
			header: 'Código',
			mobileLabel: 'Código',
			render: (row: TAssignmentReport) => (
				<span className="font-mono text-sm">{row.teacher.user.code}</span>
			),
		},
		{
			key: 'centerDepartment.department.name',
			header: 'Departamento',
			mobileLabel: 'Departamento',
			render: (row: TAssignmentReport) => (
				<span className="text-sm">{row.centerDepartment?.department?.name ?? '—'}</span>
			),
		},
		{
			key: 'centerDepartment.center.name',
			header: 'Centro',
			mobileLabel: 'Centro',
			render: (row: TAssignmentReport) => (
				<span className="text-sm text-gray-600">{row.centerDepartment?.center?.name ?? '—'}</span>
			),
		},
		{
			key: 'actions',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			render: (row: TAssignmentReport) => (
				<Button
					type="button"
					className="text-[#144C74] hover:text-[#FCC40C] transition font-medium underline"
					onClick={() =>
						handleView(row.id, row.teacher.user.name, row.teacher.user.code)
					}
					variant="unstyled"
				>
					<EyeIcon className="mt-1" />
				</Button>
			),
		},
	];

	return (
		<div className="space-y-4">
			<div className="grid items-end grid-cols-1 md:grid-cols-4 gap-4 mb-4">
				<div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-5 gap-4">
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							Buscar Docente
						</label>
						<input
							type="text"
							placeholder="Nombre de docente..."
							value={searchTerm}
							onChange={e => {
								setSearchTerm(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						/>
					</div>
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							Centro
						</label>
						<select
							value={centerFilter}
							onChange={e => {
								setCenterFilter(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						>
							<option value="">Todos los centros</option>
							{centers?.map(c => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							Departamento
						</label>
						<select
							value={departmentFilter}
							onChange={e => {
								setDepartmentFilter(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						>
							<option value="">Todos los departamentos</option>
							{departments?.map(d => (
								<option key={d.id} value={d.id}>
									{d.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							Año
						</label>
						<select
							value={yearFilter}
							onChange={e => {
								setYearFilter(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						>
							<option value="">Todos</option>
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
							value={pacFilter}
							onChange={e => {
								setPacFilter(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						>
							<option value="">Todos</option>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
						</select>
					</div>
				</div>
			</div>

			{isLoading ? (
				<Loading />
			) : (
				<>
					<div className="py-2 bg-white">
						<ResponsiveTable<TAssignmentReport>
							columns={columns}
							data={reports}
							getRowKey={r => r.id}
							loading={isLoading}
							emptyMessage="No hay informes disponibles"
						/>
					</div>
					<div className="mt-4">
						<Pagination totalPages={data?.meta?.lastPage} />
					</div>
				</>
			)}
		</div>
	);
};
