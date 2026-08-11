import { TCurrentAcademicPeriod } from '@api/periods';
import { DataTable, IDataTableColumn, Pagination } from '@shared/components';
import { IResponse } from '@shared/interfaces';
import { EyeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type TPlanificationRow = TCurrentAcademicPeriod & {
	centerDepartmentId: string;
};

interface ListPlanificationsTableProps {
	isLoading: boolean;
	data: IResponse<TPlanificationRow[]> | null;
}

export const ListPlanificationsTable = ({
	isLoading,
	data,
}: ListPlanificationsTableProps) => {
	const columns: IDataTableColumn<TPlanificationRow>[] = [
		{
			key: 'planification',
			header: 'Planificación',
			mobileLabel: 'Planificación',
			render: (row: TPlanificationRow) =>
				`PAC No. ${row.pac}, ${row.pac_modality}, ${row.year}`,
		},
		{
			key: 'actions',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			render: (row: TPlanificationRow) => (
				<Link
					className="flex justify-center items-center p-1 w-full"
					to={`/academic/planifications/details/${row.id}/${row.centerDepartmentId}/${row.year}/${row.pac}`}
				>
					<EyeIcon className="size-5 text-[#1C64B4] hover:text-[#144C74]" />
				</Link>
			),
		},
	];

	return (
		<div className="w-full py-2">
			<DataTable
				columns={columns}
				data={data?.data ?? []}
				getRowKey={row => row.id}
				loading={isLoading}
				emptyMessage="No hay planificaciones registradas"
				showRowNumber={false}
			/>
			<Pagination totalPages={data?.meta?.lastPage} />
		</div>
	);
};
