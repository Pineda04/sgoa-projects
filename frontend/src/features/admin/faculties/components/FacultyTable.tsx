import { DataTable, IDataTableColumn } from '@shared/components';
import { TFaculty } from '@api/faculties';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface FacultyTableProps {
	isLoading: boolean;
	data: TFaculty[];
	canUpdate: boolean;
	canDelete: boolean;
	onEdit: (faculty: TFaculty) => void;
	onDelete: (faculty: TFaculty) => void;
}

export const FacultyTable = ({
	isLoading,
	data,
	canUpdate,
	canDelete,
	onEdit,
	onDelete,
}: FacultyTableProps) => {
	const columns: IDataTableColumn<TFaculty>[] = [
		{ key: 'name', header: 'Nombre', mobileLabel: 'Nombre' },
		...(canUpdate || canDelete
			? [
					{
						key: 'actions' as const,
						header: 'Acciones',
						mobileLabel: 'Acciones',
						render: (row: TFaculty) => (
							<div className="flex items-center justify-center gap-3">
								{canUpdate && (
									<button
										onClick={() => onEdit(row)}
										className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
										title="Editar facultad"
									>
										<PencilSquareIcon className="size-5" />
									</button>
								)}
								{canDelete && (
									<button
										onClick={() => onDelete(row)}
										className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
										title="Eliminar facultad"
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
		<div className="mt-5">
			<DataTable
				columns={columns}
				data={data ?? []}
				getRowKey={row => row.id}
				loading={isLoading}
				emptyMessage="No hay facultades registradas"
				showRowNumber={false}
			/>
		</div>
	);
};
