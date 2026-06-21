import { useUser } from '@config/providers';
import { UserView } from '../components';
import { useNavigate } from 'react-router-dom';

export const UserProfile = () => {
	const { user } = useUser();
	const navigate = useNavigate();

	if (!user) navigate('/home', { replace: true });

	return <UserView initialData={user!} />;
};
