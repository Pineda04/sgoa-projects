import { ICoursesListProps, TCourse, useSearchCourses } from '@api/courses';
import {
	Error,
	IResponsiveColumn,
	Loading,
	Pagination,
	ResponsiveTable,
} from '@shared/components';
import { useDebounce } from '@shared/hooks';
import { useMemo, useState } from 'react';

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
					hiddenOnMobile: true,
					render: (row: CourseWithDepartment) => (
						<span className="font-medium truncate text-center">
							{row.department.name}
						</span>
					),
				},
			]
		: []),
];

export const CoursesPerDepartment = ({
	centerDepartmentId,
	showDepartmentInTable,
}: ICoursesListProps) => {
	const [searchTerm, setSearchTerm] = useState('');
	const { debouncedValue: debValue } = useDebounce(searchTerm, 1500);

	const coursesInfo = useSearchCourses(centerDepartmentId, debValue);

	const isLoading = coursesInfo.isLoading;
	const hasError = coursesInfo.isError;

	const data = coursesInfo.data?.data ?? [];
	const meta = coursesInfo.data?.meta;

	const columns = useMemo(
		() => createCourseColumns(!!showDepartmentInTable),
		[showDepartmentInTable]
	);

	if (isLoading) return <Loading />;
	if (hasError)
		return (
			<Error
				error={
					coursesInfo.error?.message ??
					'Error al cargar las asignaturas'
				}
			/>
		);

	const handleChangeSearch = ({
		target,
	}: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(target.value);
	};

	return (
		<div className="space-y-4">
			{/* <pre>{JSON.stringify(data, null, 4)}</pre> */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="w-full sm:w-64">
					<input
						type="text"
						placeholder="Buscar por código o nombre..."
						value={searchTerm}
						onChange={handleChangeSearch}
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
