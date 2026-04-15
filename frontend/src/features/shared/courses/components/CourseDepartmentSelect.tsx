import { Loading } from '@components';
import { useAuth } from '@providers/auth';
import { EUserRole } from '@types';
import { useGetAllDepartments } from '@features/centers';
import { useUser } from '@providers/user';

interface CourseDepartmentSelectProps {
	value: string;
	onChange: (departmentId: string) => void;
	disabled?: boolean;
	error?: string;
	touched?: boolean;
}

const ALLOWED_ROLES = [
	EUserRole.ADMIN,
	EUserRole.DIRECCION,
	EUserRole.RRHH,
	EUserRole.COORDINADOR_AREA,
];

export const CourseDepartmentSelect = ({
	value,
	onChange,
	disabled = false,
	error,
	touched,
}: CourseDepartmentSelectProps) => {
	const {
		authState: { user },
	} = useAuth();

	const { headPositions, isLoading: isLoadingUser } = useUser();

	const departmentsQuery = useGetAllDepartments();

	const userRoles = (user?.roles ?? []) as EUserRole[];
	const hasPriorityRole = userRoles.some(r =>
		[EUserRole.ADMIN, EUserRole.DIRECCION, EUserRole.RRHH].includes(r)
	);
	const isCoordinatorOnly =
		userRoles.includes(EUserRole.COORDINADOR_AREA) && !hasPriorityRole;
	const isAllowedRole = userRoles.some(r => ALLOWED_ROLES.includes(r));

	const isLoadingCoordinator = isLoadingUser;
	const isLoadingDepartments = departmentsQuery.isLoading;

	const isLoading = isCoordinatorOnly
		? isLoadingCoordinator
		: isLoadingDepartments;

	if (isLoading) return <Loading />;

	if (!isAllowedRole) {
		return (
			<div className="md:col-span-2 space-y-2">
				<p className="text-sm text-muted-foreground">
					No tiene permisos para crear asignaturas.
				</p>
			</div>
		);
	}

	type DepartmentOption = {
		id: string;
		name: string;
		coordinations?: { coordinator: string; center: string }[];
	};

	const getDepartments = (): DepartmentOption[] => {
		if (isCoordinatorOnly) {
			return headPositions.map(p => ({
				id: p.department.id,
				name: p.department.name,
			}));
		}

		const allDepartments = departmentsQuery.data ?? [];
		return allDepartments.map(d => ({
			id: d.id,
			name: d.name,
			coordinations: d.coordinations.map(c => ({
				coordinator: c.coordinator?.name ?? 'Sin coordinador',
				center: c.centerName,
			})),
		}));
	};

	const departments = getDepartments();

	const formatCoordination = (coord: { coordinator: string; center: string }) => {
		return `${coord.coordinator} - ${coord.center}`;
	};

	return (
		<div className="md:col-span-2 space-y-2">
			<label
				htmlFor="departmentId"
				className="text-sm font-medium text-foreground"
			>
				Departamento
			</label>
			<select
				id="departmentId"
				value={value}
				onChange={e => onChange(e.target.value)}
				disabled={disabled}
				className="w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors disabled:text-muted-foreground"
			>
				<option value="">Seleccione un departamento</option>
				{departments.map(dept => (
					<option key={dept.id} value={dept.id}>
						{isCoordinatorOnly
							? dept.name
							: dept.name +
							  (dept.coordinations && dept.coordinations.length > 0
									? ` (${dept.coordinations.map(formatCoordination).join(', ')})`
									: ' (Sin coordinador)')}
					</option>
				))}
			</select>
			{touched && error ? (
				<p className="text-xs text-destructive">{error}</p>
			) : null}
			<p className="text-xs text-muted-foreground mt-2">
				<strong>Nota:</strong> Las clases que se creen se compartirán con todos los centros.
				Si cambia el estado a inactivo/a, se cambiará en todos los centros por igual.
			</p>
		</div>
	);
};