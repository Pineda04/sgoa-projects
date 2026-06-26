import { useMemo, useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { CourseDepartmentFilter } from './CourseDepartmentFilter';
import { ICoursesListProps, TCourseClassroom, useGetCoursesByCenterDepartment } from '@api/courses';
import { Error, IResponsiveColumn, Loading, ResponsiveTable } from '@shared/components';
import { useGetCurrentAcademicPeriod } from '@api/periods';
import { useAbility } from '@config';

interface CourseWithTeacher extends TCourseClassroom {
	teacher?: {
		id: string;
		name: string;
		code: string;
	};
}

const CourseColumns: IResponsiveColumn<CourseWithTeacher>[] = [
	{ key: 'course.code', header: 'Cod.', mobileLabel: 'Cod.' },
	{
		key: 'course.name',
		header: 'Asignatura',
		mobileLabel: 'Asig.',
		render: (row: CourseWithTeacher) => (
			<span className="font-medium max-w-50 truncate block">
				{row.course.name}
			</span>
		),
	},
	{
		key: 'section',
		header: 'Sec.',
		mobileLabel: 'Sec.',
		render: (row: CourseWithTeacher) => (
			<span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
				{row.section}
			</span>
		),
	},
	{ key: 'course.uvs', header: 'UV', mobileLabel: 'UV' },
	{
		key: 'days',
		header: 'Días',
		mobileLabel: 'Días',
		hiddenOnMobile: true,
	},
	{
		key: 'studentCount',
		header: 'Alumnos',
		mobileLabel: 'Alum.',
		render: (row: CourseWithTeacher) => (
			<span className="inline-flex items-center gap-1">
				<Users className="w-3 h-3 text-muted-foreground" />
				{row.studentCount}
			</span>
		),
	},
	{
		key: 'classroom.name',
		header: 'Aula',
		mobileLabel: 'Aula',
		hiddenOnMobile: true,
	},
];

const AuthorityColumns: IResponsiveColumn<CourseWithTeacher>[] = [
	...CourseColumns,
	{
		key: 'teacher.name',
		header: 'Docente',
		mobileLabel: 'Docente',
		hiddenOnMobile: true,
		render: (row: CourseWithTeacher) => row.teacher?.name ?? '-',
	},
	{
		key: 'coordinator.name',
		header: 'Coordinador',
		mobileLabel: 'Coord.',
		hiddenOnMobile: true,
	},
];

export const CoursesList = ({
	centerDepartmentId,
	centerId: initialCenterId,
	showDepartmentFilter = false,
}: ICoursesListProps) => {
	const ability = useAbility();
	const academicPeriodInfo = useGetCurrentAcademicPeriod();
	const periodId = academicPeriodInfo.data?.id;

	const [selectedDepartment, setSelectedDepartment] = useState(
		centerDepartmentId ?? ''
	);

	const [centerId, setCenterId] = useState(initialCenterId ?? '');

	const handleCenterChange = (newCenterId: string) => {
		setCenterId(newCenterId);
		setSelectedDepartment('');
	};

	useEffect(() => {
		if (centerDepartmentId) {
			setSelectedDepartment(centerDepartmentId);
		}
	}, [centerDepartmentId]);

	const effectiveCenterDepartmentId = showDepartmentFilter
		? selectedDepartment
		: centerDepartmentId;

	const coursesInfo = useGetCoursesByCenterDepartment(
		effectiveCenterDepartmentId ?? '',
		periodId ?? ''
	);

	const isLoading =
		coursesInfo.isLoading ||
		academicPeriodInfo.isLoading ||
		(showDepartmentFilter && !selectedDepartment && !centerDepartmentId);

	const hasError = coursesInfo.isError || academicPeriodInfo.isError;

	const columns = useMemo(() => {
		if (showDepartmentFilter) {
			return AuthorityColumns;
		}
		return CourseColumns;
	}, [showDepartmentFilter]);

	if (isLoading) return <Loading />;
	if (hasError)
		return (
			<Error
				error={
					coursesInfo.error?.message ?? 'Error al cargar las clases'
				}
			/>
		);

	return (
		<div className="space-y-4">
			{showDepartmentFilter && ability.can('read', 'centers') && (
				<CourseDepartmentFilter
					value={selectedDepartment}
					centerId={centerId}
					onChange={setSelectedDepartment}
					onCenterChange={handleCenterChange}
				/>
			)}

			<div className="bg-card border border-card-border rounded-xl shadow-lg shadow-primary/5 overflow-hidden">
				<ResponsiveTable<CourseWithTeacher>
					columns={columns}
					data={(coursesInfo.data ?? []) as CourseWithTeacher[]}
					getRowKey={c => c.id}
					loading={coursesInfo.isLoading}
					emptyMessage="No hay clases disponibles"
				/>
			</div>
		</div>
	);
};
