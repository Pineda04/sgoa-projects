import { UsersTable } from '@features/admin';
import { useNavigate } from 'react-router-dom';

interface IProps {
	centerDepartmentId: string;
}

export const UsersCoordinator = ({ centerDepartmentId }: IProps) => {
	const navigate = useNavigate();

	return (
		<UsersTable
			centerDepartmentId={centerDepartmentId}
			onNavigateToCreate={() => navigate('/admin/users/new')}
		/>
	);
};
