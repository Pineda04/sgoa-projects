import { useGetTeachers } from '@api/teachers';
import { useNavigate } from 'react-router-dom';
import { UsersTable } from '../components';

export const ListUsers = () => {
	const { isLoading, isError, data } = useGetTeachers();
	const navigate = useNavigate();

	if (!data && !isLoading) {
		return <p>No hay usuarios agregados...</p>;
	}

	return (
		<>
			{data && (
				<UsersTable
					isLoading={isLoading}
					isError={isError}
					data={data}
					onNavigateToCreate={() => navigate('/admin/users/new')}
				/>
			)}
		</>
	);
};
