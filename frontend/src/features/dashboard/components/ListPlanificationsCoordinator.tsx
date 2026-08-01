import { useState } from 'react';
import { useGetAcademicAssignmentCoordinatorOnlyPeriods } from '@api/assignment-reports';
import { ListPlanificationsTable } from '@features/academic/planifications';
import { Button } from '@shared/components';
import { usePaginationParams } from '@shared/hooks';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface IProps {
	centerDepartmentId: string;
}

export const ListPlanificationsCoordinator = ({
	centerDepartmentId,
}: IProps) => {
	const { setPage } = usePaginationParams();
	const navigate = useNavigate();
	const [yearFilter, setYearFilter] = useState('');
	const [pacFilter, setPacFilter] = useState('');

	const { isLoading, isError, data } =
		useGetAcademicAssignmentCoordinatorOnlyPeriods(
			centerDepartmentId,
			yearFilter || undefined,
			pacFilter || undefined
		);

	return (
		<div className="space-y-4">
			<div className="grid items-end grid-cols-1 md:grid-cols-4 gap-4 mb-4">
				<div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							Año
						</label>
						<input
							type="number"
							placeholder="Filtrar por año..."
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
				<div className="flex justify-end col-span-1">
					<Button
						onClick={() =>
							navigate(
								`/academic/planifications/new/${centerDepartmentId}`
							)
						}
						className="bg-green-500 text-white p-2 hover:bg-green-600 transition"
					>
						<Plus className="size-4 mr-1" />
						Agregar planificación
					</Button>
				</div>
			</div>

			<ListPlanificationsTable
				isLoading={isLoading}
				isError={isError}
				data={data ?? null}
			/>
		</div>
	);
};
