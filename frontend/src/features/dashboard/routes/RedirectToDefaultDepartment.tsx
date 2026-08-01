import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Loading, TagError } from '@shared/components';
import { useUser } from '@config/providers';

export const RedirectToDefaultDepartment = () => {
	const navigate = useNavigate();
	const { headPositions, isLoading } = useUser();

	const hasCoordination = headPositions?.length > 0;

	useEffect(() => {
		if (isLoading || !hasCoordination) return;

		navigate(
			`/dashboard/coordinator/${headPositions[0].centerDepartmentId}`,
			{ replace: true }
		);
	}, [hasCoordination, headPositions, isLoading, navigate]);

	if (isLoading) return <Loading />;

	// El panel de coordinación se abre siempre sobre un departamento concreto.
	// Tener el permiso no alcanza: el usuario debe estar asignado como jefe de
	// alguno.
	if (!hasCoordination)
		return (
			<TagError text="Tu rol permite ver el panel de coordinación, pero tu usuario no está asignado como Jefe de Departamento en ningún departamento. Solicita a un administrador que te asigne ese cargo." />
		);

	return <Loading />;
};
