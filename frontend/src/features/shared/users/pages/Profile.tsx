import { useUser } from '@providers/user';
import { UserView } from '../components';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
	const { user } = useUser();

	const navigate = useNavigate();

	if (!user) navigate('/home', { replace: true });

	// useEffect(() => {
	// 	if (!user) navigate('/home', { replace: true });
	// }, [user, navigate]);

	return <UserView initialData={user!} />;
};
