import { CourseList } from '@features/shared/courses';

export const CoursesAuthority = () => {
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
			<CourseList showDepartmentFilter showDepartmentInTable />
		</div>
	);
};
