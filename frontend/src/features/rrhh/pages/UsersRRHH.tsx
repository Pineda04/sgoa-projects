import { useGetTeachers, UserTable } from '@features/shared/users';
import { useNavigate } from 'react-router-dom';

export const UsersRHHH = () => {
	const { isLoading, isError, data } = useGetTeachers();
	const navigate = useNavigate();

	if (!data && !isLoading) {
		// TODO: Se puede agregar una tabla vacia o agregar algun texto como vacio o icono
		return <p>No hay usuarios agregados...</p>;
	}

	return (
		<>
			{data && (
				<UserTable
					isLoading={isLoading}
					isError={isError}
					data={data}
					onNavigateToCreate={() => navigate('/rrhh/crear-usuario')}
				/>
			)}
		</>
	);
};
