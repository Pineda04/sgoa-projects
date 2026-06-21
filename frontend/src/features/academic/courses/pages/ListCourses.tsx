import { useAuth } from '@config/providers';
import { CourseList } from '@features/academic/courses';
import { EUserRole } from '@shared/constants';

export const ListCourses = () => {
	const { authState } = useAuth();
	const roles = (authState.user?.roles ?? []) as EUserRole[];
	const showDepartment = roles.some(r =>
		[EUserRole.ADMIN, EUserRole.DIRECCION].includes(r)
	);

	return (
		<div className="pb-8 sm:pb-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-foreground">
					Gestión de Asignaturas
				</h1>
				<p className="text-muted-foreground mt-1">
					Ver todas las asignaturas por departamento
				</p>
			</div>
			<CourseList showDepartmentFilter showDepartmentInTable={showDepartment} />
		</div>
	);
};
