import { ListPlanificationsTable } from '@features/shared/planifications';
import { useGetAcademicAssignmentCoordinatorOnlyPeriods } from '../hooks';

interface IProps {
	centerDepartmentId: string;
}

export const ListPlanificationsCoordinator = ({
	centerDepartmentId,
}: IProps) => {
	const { isLoading, isError, data } =
		useGetAcademicAssignmentCoordinatorOnlyPeriods(centerDepartmentId);

	return (
		<>
			<ListPlanificationsTable
				isLoading={isLoading}
				isError={isError}
				data={data ?? null}
			/>
		</>
	);
};
