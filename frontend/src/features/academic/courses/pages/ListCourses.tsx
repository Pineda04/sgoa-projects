import { useAbility } from '@config';
import { CourseList } from '@features/academic/courses';

export const ListCourses = () => {
	const ability = useAbility();
	const showDepartment = ability.can('manage', 'departments');

	return (
		<div className="pb-8 sm:pb-12">
			<div className="mb-6">
				<h1 className="text-2xl font-bold text-foreground">
					Gestión de Asignaturas
				</h1>
				<p className="text-muted-foreground mt-1">
					Ver todas las clases que ofrece la universidad.
				</p>
			</div>
			<CourseList showDepartmentFilter showDepartmentInTable={showDepartment} />
		</div>
	);
};
