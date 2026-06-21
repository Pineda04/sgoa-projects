import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, Plus } from 'lucide-react';
import { CourseDepartmentFilter } from './CourseDepartmentFilter';
import { Button, Error, IResponsiveColumn, Loading, Pagination, ResponsiveTable } from '@shared/components';
import { ICoursesListProps, TCourse, useGetAllCourses, useSearchCourses } from '@api/courses';
import { useAbility } from '@config';
import { useDebounce } from '@shared/hooks';

interface CourseWithDepartment extends TCourse {
	department: {
		id: string;
		name: string;
	};
}

const createCourseColumns = (
	showDepartmentInTable: boolean
): IResponsiveColumn<CourseWithDepartment>[] => [
	{ key: 'code', header: 'Código', mobileLabel: 'Cod.' },
	{
		key: 'name',
		header: 'Asignatura',
		mobileLabel: 'Asig.',
		render: (row: CourseWithDepartment) => (
			<span className="font-medium max-w-50 truncate text-center w-full">
				{row.name}
			</span>
		),
	},
	{ key: 'uvs', header: 'UV', mobileLabel: 'UV' },
	{
		key: 'activeStatus',
		header: 'Estado',
		mobileLabel: 'Estado',
		render: (row: CourseWithDepartment) =>
			row.activeStatus ? (
				<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
					Activo
				</span>
			) : (
				<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
					Inactivo
				</span>
			),
	},
	...(showDepartmentInTable
		? [
				{
					key: 'departmentName',
					header: 'Departamento',
					mobileLabel: 'Depto.',
					// hiddenOnMobile: true,
					render: (row: CourseWithDepartment) => (
						<span className="font-medium truncate text-center">
							{row.department.name}
						</span>
					),
				},
			]
		: []),
	{
		key: 'actions',
		header: '',
		mobileLabel: '',
		render: (row: CourseWithDepartment) => (
			<Link
				to={`/academic/courses/${row.id}`}
				className="cursor-pointer text-primary hover:text-primary/80"
			>
				<EyeIcon className="size-5" />
			</Link>
		),
	},
];

export const CourseList = ({
	centerDepartmentId,
	centerId: initialCenterId,
	showDepartmentFilter = false,
	showDepartmentInTable = false,
}: ICoursesListProps) => {
	const navigate = useNavigate();
	const ability = useAbility();
	const canCreateCourse = ability.can('create', 'courses');

	const [selectedDepartment, setSelectedDepartment] = useState(
		centerDepartmentId ?? ''
	);

	const [centerId, setCenterId] = useState(initialCenterId ?? '');

	const handleCenterChange = (newCenterId: string) => {
		setCenterId(newCenterId);
		setSelectedDepartment('');
	};

	const [searchTerm, setSearchTerm] = useState('');
	const { debouncedValue: debValue } = useDebounce(searchTerm, 1500);

	const effectiveCenterDepartmentId = showDepartmentFilter
		? selectedDepartment || undefined
		: centerDepartmentId;

	const coursesInfo = useSearchCourses(
		effectiveCenterDepartmentId,
		debValue
	);

	const allCoursesInfo = useGetAllCourses(showDepartmentFilter, debValue);

	const hasFilter = selectedDepartment || searchTerm;

	const isLoading = hasFilter
		? coursesInfo.isLoading
		: allCoursesInfo.isLoading;

	const hasError = hasFilter ? coursesInfo.isError : allCoursesInfo.isError;

	const data = hasFilter
		? selectedDepartment
			? (coursesInfo.data?.data ?? [])
			: (allCoursesInfo.data?.data ?? [])
		: (allCoursesInfo.data?.data ?? []);

	const meta = hasFilter
		? selectedDepartment
			? coursesInfo.data?.meta
			: allCoursesInfo.data?.meta
		: allCoursesInfo.data?.meta;

	const columns = useMemo(
		() => createCourseColumns(!!showDepartmentInTable),
		[showDepartmentInTable]
	);

	if (isLoading) return <Loading />;
	if (hasError)
		return (
			<Error
				error={
					(hasFilter ? coursesInfo.error : allCoursesInfo.error)
						?.message ?? 'Error al cargar las asignaturas'
				}
			/>
		);

	return (
		<div className="space-y-4">
			{canCreateCourse && (
				<div className="flex justify-end">
					<Button
						onClick={() => navigate('/academic/courses/new')}
						className="bg-green-600 hover:bg-green-700"
					>
						<Plus className="size-4 mr-1" />
						Nueva Clase
					</Button>
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-3 gap-x-0 md:gap-x-10 gap-y-5 md:gap-y-0">
				{showDepartmentFilter && (
					<CourseDepartmentFilter
						value={selectedDepartment}
						centerId={centerId}
						onChange={setSelectedDepartment}
						onCenterChange={handleCenterChange}
					/>
				)}
				<div className="w-full">
					<label className="block mb-2 font-semibold text-sm text-foreground">
						Búsqueda por término
					</label>
					<input
						type="text"
						placeholder="Buscar por código o nombre..."
						value={searchTerm}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setSearchTerm(e.target.value)
						}
						className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
					/>
				</div>
			</div>

			<div className="bg-card border border-card-border rounded-xl shadow-lg shadow-primary/5 overflow-hidden">
				<ResponsiveTable<CourseWithDepartment>
					columns={columns}
					data={data as CourseWithDepartment[]}
					getRowKey={c => c.id}
					loading={coursesInfo.isLoading}
					emptyMessage="No hay asignaturas disponibles"
				/>
			</div>
			<div className="">
				<Pagination totalPages={meta?.lastPage} />
			</div>
		</div>
	);
};
