import { useGetAllPeriodsForAuthorities } from '@api/assignment-reports';
import { TCurrentAcademicPeriod } from '@api/periods';
import { DataTable, IDataTableColumn, Pagination, TagError } from '@shared/components';
import { EyeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type TPlanificationAuthorityRow = TCurrentAcademicPeriod & {
	centerDepartmentId: string;
	centerName: string;
	departmentName: string;
};

export const ListPlanificationsAuthorities = () => {
	const { isLoading, isError, data } = useGetAllPeriodsForAuthorities();

	if (isError) return <TagError />;

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
	);
};
