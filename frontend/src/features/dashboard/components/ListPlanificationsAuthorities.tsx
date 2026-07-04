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
				<div className="flex flex-col gap-0.5">
					<span className="font-medium text-[#144C74]">
						PAC No. {row.pac}, {row.pac_modality}, {row.year}
					</span>
					<span className="text-sm text-gray-600">
						{row.departmentName}
					</span>
					<span className="text-xs text-gray-400">
						{row.centerName}
					</span>
				</div>
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
