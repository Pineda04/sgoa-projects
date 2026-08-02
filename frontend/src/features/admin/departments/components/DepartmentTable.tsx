import type { IResponse } from '@shared/interfaces';
import {
	DataTable,
	IDataTableColumn,
} from '@shared/components';
import { TOutputDepartment } from '@api/departments';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface DepartmentTableProps {
	isLoading: boolean;
	data: IResponse<TOutputDepartment[]> | null;
	canUpdate: boolean;
	canDelete: boolean;
	onEdit: (department: TOutputDepartment) => void;
	onDelete: (department: TOutputDepartment) => void;
}

export const DepartmentTable = ({
	isLoading,
	data,
	canUpdate,
	canDelete,
	onEdit,
	onDelete,
}: DepartmentTableProps) => {

	const columns: IDataTableColumn<TOutputDepartment>[] = [
		{ key: 'name', header: 'Nombre', mobileLabel: 'Nombre' },
		{ key: 'facultyName', header: 'Facultad', mobileLabel: 'Facultad' },
		{
			key: 'uvs',
			header: 'UV',
			mobileLabel: 'UV',
			render: (row: TOutputDepartment) =>
				row.uvs !== null ? row.uvs : '—',
		},
		...(canUpdate || canDelete
			? [
					{
						key: 'actions' as const,
						header: 'Acciones',
						mobileLabel: 'Acciones',
						render: (row: TOutputDepartment) => (
							<div className="flex items-center justify-center gap-3">
								{canUpdate && (
									<button
										onClick={() => onEdit(row)}
										className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
										title="Editar departamento"
									>
										<PencilSquareIcon className="size-5" />
									</button>
								)}
								{canDelete && (
									<button
										onClick={() => onDelete(row)}
										className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
										title="Eliminar departamento"
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
				data={data?.data ?? []}
				getRowKey={row => row.id}
				loading={isLoading}
				emptyMessage="No hay departamentos registrados"
				showRowNumber={false}
			/>
		</div>
	);
};
