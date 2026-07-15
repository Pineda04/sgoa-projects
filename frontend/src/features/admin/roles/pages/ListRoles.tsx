import { useGetAllRoles } from '@api/roles';
import { RoleTable } from '../components';

export const ListRoles = () => {
	const roles = useGetAllRoles();

	return (
		<div className="pb-8 sm:pb-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-foreground">
					Roles y Permisos
				</h1>
				<p className="text-muted-foreground mt-1">
					Crea roles y define qué puede hacer cada uno. Luego asígnalos a los
					usuarios desde la gestión de usuarios.
				</p>
			</div>

			{roles.isError ? (
				<p className="text-sm text-red-500">
					Error al cargar los roles. Intenta nuevamente.
				</p>
			) : (
				<RoleTable data={roles.data ?? []} isLoading={roles.isLoading} />
			)}
		</div>
	);
};
