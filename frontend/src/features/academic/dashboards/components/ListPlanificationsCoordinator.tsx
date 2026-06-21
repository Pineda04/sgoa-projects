import { useGetAcademicAssignmentCoordinatorOnlyPeriods } from '@api/assignment-reports';
import { ListPlanificationsTable } from '@features/academic/planifications';

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
