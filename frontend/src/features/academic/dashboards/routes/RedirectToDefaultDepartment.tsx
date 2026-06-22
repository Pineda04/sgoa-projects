import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loading } from '@shared/components';
import { useUser } from '@config/providers';

export const RedirectToDefaultDepartment = () => {
	const navigate = useNavigate();
	const { headPositions, isLoading } = useUser();

	useEffect(() => {
		if (isLoading) return;

		if (headPositions?.length > 0) {
			const defaultId = headPositions[0].centerDepartmentId;

			navigate(`/academic/dashboards/coordinator/${defaultId}`, {
				replace: true,
			});
		} else {
			navigate('/', { replace: true });
		}
	}, [headPositions, isLoading, navigate]);

	return <Loading />;
};
