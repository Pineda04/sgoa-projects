import { useMemo, useState } from 'react';
import { useGetAcademicAssignmentReportsCoordinatorByCenter } from '@api/assignment-reports';
import {
	Button,
	IResponsiveColumn,
	Loading,
	Pagination,
	ResponsiveTable,
} from '@shared/components';
import { EyeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebounce, usePaginationParams } from '@shared/hooks';
import { useGetAcademicPeriods } from '@api/periods';

interface ReportData {
	id: string;
	period: {
		year: number;
		pac_modality: string;
		pac: number;
	};
	teacher: {
		user: {
			name: string;
			code: string;
		};
	};
}

interface IProps {
	centerDepartmentId: string;
}

export const ListAcademicAssignmentReports = ({
	centerDepartmentId,
}: IProps) => {
	const navigate = useNavigate();
	const { setPage } = usePaginationParams();

	const [searchTerm, setSearchTerm] = useState('');
	const { debouncedValue: debouncedSearch } = useDebounce(searchTerm, 500);
	const [yearFilter, setYearFilter] = useState('');
	const [pacFilter, setPacFilter] = useState('');

	const { data: periods } = useGetAcademicPeriods();

	const years = useMemo(() => {
		if (!periods) return [];
		const uniqueYears = [...new Set(periods.map(p => p.year))];
		return uniqueYears.sort((a, b) => b - a);
	}, [periods]);

	const { isLoading, data } =
		useGetAcademicAssignmentReportsCoordinatorByCenter(
			centerDepartmentId,
			undefined,
			undefined,
			yearFilter || undefined,
			pacFilter || undefined,
			debouncedSearch || undefined
		);

	const reports = (data?.data ?? []) as ReportData[];

	const handleView = (
		reportId: string,
		teacherName: string,
		teacherCode: string
	) => {
		navigate(`/academic/reports/coordinator/${reportId}`, {
			state: {
				teacherName,
				teacherCode,
			},
		});
	};

	const columns: IResponsiveColumn<ReportData>[] = [
		{
			key: 'period',
			header: 'Periodo',
			mobileLabel: 'Periodo',
			render: (row: ReportData) => (
				<span>
					<span className="font-medium text-[#144C74]">
						{row.period.year}
					</span>
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
			key: 'actions',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			render: (row: ReportData) => (
				<Button
					type="button"
					className="text-[#144C74] hover:text-[#FCC40C] transition font-medium underline"
					onClick={() => {
						handleView(
							row.id,
							row.teacher.user.name,
							row.teacher.user.code
						);
					}}
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
				<div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
						<ResponsiveTable<ReportData>
							columns={columns}
							data={reports}
							getRowKey={r => r.id}
							loading={isLoading}
							emptyMessage="No hay reportes disponibles"
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
