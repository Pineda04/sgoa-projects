import { useState } from 'react';
import { useGetAllPeriodsForAuthorities } from '@api/assignment-reports';
import { TCurrentAcademicPeriod } from '@api/periods';
import { useGetAllDepartments } from '@api/departments';
import { useGetAllCenters } from '@api/centers';
import { DataTable, IDataTableColumn, Pagination, TagError, Loading } from '@shared/components';
import { EyeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePaginationParams } from '@shared/hooks';

type TPlanificationAuthorityRow = TCurrentAcademicPeriod & {
	centerDepartmentId: string;
	centerName: string;
	departmentName: string;
};

export const ListPlanificationsAuthorities = () => {
	const { setPage } = usePaginationParams();

	const [yearFilter, setYearFilter] = useState('');
	const [pacFilter, setPacFilter] = useState('');
	const [departmentFilter, setDepartmentFilter] = useState('');
	const [centerFilter, setCenterFilter] = useState('');

	const { data: departments } = useGetAllDepartments();
	const { data: centers } = useGetAllCenters();

	const { isLoading, isError, data } = useGetAllPeriodsForAuthorities(
		yearFilter || undefined,
		pacFilter || undefined,
		departmentFilter || undefined,
		centerFilter || undefined
	);

	const columns: IDataTableColumn<TPlanificationAuthorityRow>[] = [
		{
			key: 'planification',
			header: 'Planificación',
			mobileLabel: 'Planificación',
			render: (row: TPlanificationAuthorityRow) => (
				<span className="font-medium text-[#144C74]">
					PAC No. {row.pac}, {row.pac_modality}, {row.year}
				</span>
			),
		},
		{
			key: 'departmentName',
			header: 'Departamento',
			mobileLabel: 'Departamento',
			render: (row: TPlanificationAuthorityRow) => (
				<span>{row.departmentName}</span>
			),
		},
		{
			key: 'centerName',
			header: 'Centro',
			mobileLabel: 'Centro',
			render: (row: TPlanificationAuthorityRow) => (
				<span>{row.centerName}</span>
			),
		},
		{
			key: 'actions',
			header: 'Ver contenido',
			mobileLabel: 'Ver',
			render: (row: TPlanificationAuthorityRow) => (
				<Link
					className="flex justify-center items-center p-1 w-full"
					to={`/academic/planifications/authority/${row.id}/${row.centerDepartmentId}/${row.year}/${row.pac}`}
				>
					<EyeIcon className="size-5 text-[#1C64B4] hover:text-[#144C74]" />
				</Link>
			),
		},
	];

	return (
		<div className="space-y-4">
			<div className="grid items-end grid-cols-1 md:grid-cols-4 gap-4 mb-4">
				<div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
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
						<input
							type="number"
							placeholder="Ej. 2025"
							value={yearFilter}
							onChange={e => {
								setYearFilter(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						/>
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
			) : isError ? (
				<TagError text="No se encontraron datos disponibles." />
			) : (
				<div className="w-full py-2">
					<DataTable<TPlanificationAuthorityRow>
						columns={columns}
						data={(data?.data ?? []) as TPlanificationAuthorityRow[]}
						getRowKey={row => `${row.id}-${row.centerDepartmentId}`}
						loading={isLoading}
						emptyMessage="No hay planificaciones registradas"
						showRowNumber={false}
					/>
					<Pagination totalPages={data?.meta?.lastPage} />
				</div>
			)}
		</div>
	);
};
