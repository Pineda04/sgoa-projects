import { useGetDepartments } from '@api/departments';
import { DepartmentTable } from '../components';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAbility, useAuth } from '@config';
import { Button } from '@shared/components';
import { Plus } from 'lucide-react';

export const ListDepartments = () => {
	const {
		authState: { user },
	} = useAuth();
	const { isLoading, isError, data } = useGetDepartments();
	const navigate = useNavigate();
	const ability = useAbility();
	const canCreate = ability.can('create', 'departments');

	const roles = user?.roles ?? [];
	const isDocenteOnly =
		roles.includes('DOCENTE') &&
		!roles.some(r =>
			['ADMIN', 'DIRECCION', 'RRHH', 'COORDINADOR_AREA'].includes(r)
		);

	if (isDocenteOnly) {
		return <Navigate to="/home" replace />;
	}

	return (
		<div className="pb-8 sm:pb-12">
			<div className="flex justify-between items-end mb-5">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Gestión de Departamentos
					</h1>
					<p className="text-muted-foreground mt-1">
						Visualice todos los departamentos disponibles.
					</p>
				</div>
				{canCreate && (
					<Button
						type="button"
						className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
						onClick={() => navigate('/admin/departments/new')}
					>
						<Plus className="size-6" />
						Nuevo departamento
					</Button>
				)}
			</div>
			{isError ? (
				<p>Error al cargar los departamentos. Intenta nuevamente</p>
			) : !data && !isLoading ? (
				<p>No hay departamentos agregados...</p>
			) : (
				data && (
					<DepartmentTable
						data={data}
						isError={isError}
						isLoading={isLoading}
					/>
				)
			)}
		</div>
	);
};
