import type { IResponse } from '@types';
import { UserTable } from '@features/shared/users';
import { TOutputTeacherPosition } from '@features/teachers/types/teacher.types';
import { useNavigate } from 'react-router-dom';
import { useGetTeachersCoordinator } from '../hooks';

interface IProps {
	centerDepartmentId: string;
}

export const UsersCoordinator = ({ centerDepartmentId }: IProps) => {
	const { isLoading, isError, data } = useGetTeachersCoordinator(
		centerDepartmentId
	);
	const navigate = useNavigate();

	if (!data && !isLoading) {
		// TODO: Se puede agregar una tabla vacia o agregar algun texto como vacio o icono
		return <p>No hay usuarios agregados...</p>;
	}

	return (
		<>
			<UserTable
				isLoading={isLoading}
				isError={isError}
				data={(data as IResponse<TOutputTeacherPosition[]>) ?? null}
				onNavigateToCreate={() =>
					navigate('/coordinadores/crear-usuario')
				}
			/>
		</>
	);
};
