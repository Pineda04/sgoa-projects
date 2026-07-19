import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { TOutputPosition } from '@api/positions';
import { DataTable, IDataTableColumn } from '@shared';

interface PositionTableProps {
	data: TOutputPosition[];
	isLoading: boolean;
	canUpdate: boolean;
	canDelete: boolean;
	onEdit: (position: TOutputPosition) => void;
	onDelete: (position: TOutputPosition) => void;
}

export const PositionTable = ({
	data,
	isLoading,
	canUpdate,
	canDelete,
	onEdit,
	onDelete,
}: PositionTableProps) => {
	const columns: IDataTableColumn<TOutputPosition>[] = [
		{
			key: 'name',
			header: 'Nombre',
			mobileLabel: 'Nombre',
		},
		...(canUpdate || canDelete
			? [
					{
						key: 'actions',
						header: 'Acciones',
						mobileLabel: 'Acciones',
						render: (row: TOutputPosition) => (
							<div className="flex items-center justify-center gap-3">
								{canUpdate && (
									<button
										type="button"
										onClick={e => {
											e.stopPropagation();
											onEdit(row);
										}}
										className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
										title="Editar posición"
									>
										<PencilSquareIcon className="size-5" />
									</button>
								)}
								{canDelete && (
									<button
										type="button"
										onClick={e => {
											e.stopPropagation();
											onDelete(row);
										}}
										className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
										title="Eliminar posición"
									>
										<TrashIcon className="size-5" />
									</button>
								)}
							</div>
						),
					},
				]
			: []),
	];

	return (
		<DataTable<TOutputPosition>
			columns={columns}
			data={data}
			getRowKey={row => row.id}
			loading={isLoading}
			emptyMessage="No hay posiciones registradas"
			showRowNumber={false}
		/>
	);
};
