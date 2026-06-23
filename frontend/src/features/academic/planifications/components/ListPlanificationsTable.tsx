import { TCurrentAcademicPeriod } from '@api/periods';
import { DataTable, IDataTableColumn, Pagination, TagError } from '@shared/components';
import { IResponse } from '@shared/interfaces';
import { EyeIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

type TPlanificationRow = TCurrentAcademicPeriod & {
	centerDepartmentId: string;
};

interface ListPlanificationsTableProps {
	isLoading: boolean;
	isError: boolean;
	data: IResponse<TPlanificationRow[]> | null;
}

export const ListPlanificationsTable = ({
	isLoading,
	isError,
	data,
}: ListPlanificationsTableProps) => {
	if (isError) return <TagError />;

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
			header: 'Ver contenido',
			mobileLabel: 'Ver',
			render: (row: TPlanificationRow) => (
				<Link
					className="flex justify-center items-center p-1 w-full"
					to="/academic/planifications"
					state={{
						year: row.year,
						pac: row.pac,
						periodId: row.id,
						centerDepartmentId: row.centerDepartmentId,
					}}
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
				className="sm:w-[80%]"
			/>
			<Pagination totalPages={data?.meta?.lastPage} />
		</div>
	);
};
