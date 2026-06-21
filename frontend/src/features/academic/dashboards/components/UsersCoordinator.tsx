import { TOutputTeacherPosition, useGetTeachersCoordinator } from '@api/teachers';
import { UsersTable } from '@features/admin';
import { IResponse } from '@shared/interfaces';
import { useNavigate } from 'react-router-dom';

interface IProps {
	centerDepartmentId: string;
}

export const UsersCoordinator = ({ centerDepartmentId }: IProps) => {
	const { isLoading, isError, data } = useGetTeachersCoordinator(
		centerDepartmentId
	);
	const navigate = useNavigate();

	if (!data && !isLoading) {
		return <p>No hay usuarios agregados...</p>;
	}

	return (
		<>
			<UsersTable
				isLoading={isLoading}
				isError={isError}
				data={(data as IResponse<TOutputTeacherPosition[]>) ?? null}
				onNavigateToCreate={() =>
					navigate('/admin/users/new')
				}
			/>
		</>
	);
};
