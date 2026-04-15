import { useNavigate } from 'react-router-dom';
import { useUser } from '@providers/user';
import { useEffect } from 'react';
import { Loading } from '@components'; // o tu spinner

export const RedirectToDefaultDepartment = () => {
	const navigate = useNavigate();
	const { headPositions, isLoading } = useUser(); // asumo que tienes isLoading en el contexto

	useEffect(() => {
		if (isLoading) return;

		if (headPositions?.length > 0) {
			const defaultId = headPositions[0].centerDepartmentId;

			navigate(`/coordinadores/dashboard-coordinador/${defaultId}`, {
				replace: true,
			});
		} else {
			// No tiene cargos → redirigir a página de error o home
			// navigate('/coordinadores/sin-cargos', { replace: true });
			navigate('/', { replace: true });
		}
	}, [headPositions, isLoading, navigate]);

	return <Loading />;
};
