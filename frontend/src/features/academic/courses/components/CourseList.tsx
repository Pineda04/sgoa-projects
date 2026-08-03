import { useMemo, useState } from 'react';
import { EyeIcon, Plus } from 'lucide-react';
import { CourseDepartmentFilter } from './CourseDepartmentFilter';
import { CreateCourseModal } from './CreateCourseModal';
import { CourseViewModal } from './CourseViewModal';
import {
	Button,
	Error,
	IResponsiveColumn,
	Loading,
	Pagination,
	ResponsiveTable,
} from '@shared/components';
import {
	ICoursesListProps,
	TCourse,
	useGetAllCourses,
	useSearchCourses,
} from '@api/courses';
import { useAbility } from '@config';
import { useDebounce, useModal, usePaginationParams } from '@shared/hooks';

interface CourseWithDepartment extends TCourse {
	department: {
		id: string;
		name: string;
	};
}

const createCourseColumns = (
	showDepartmentInTable: boolean,
	canUpdate: boolean,
	onView: (id: string) => void
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
					render: (row: CourseWithDepartment) => (
						<span className="font-medium truncate text-center">
							{row.department.name}
						</span>
					),
				},
			]
		: []),
	...(canUpdate
		? [
				{
					key: 'actions' as const,
					header: 'Acciones',
					mobileLabel: 'Acciones',
        render: (row: CourseWithDepartment) => (
            <div className='flex items-center justify-center'>
  						<button
  							onClick={() => onView(row.id)}
  							title="Ver / Editar clase"
  							className="flex justify-center cursor-pointer text-primary hover:text-primary/80"
  						>
  							<EyeIcon className="size-5" />
  						</button>
            </div>
					),
				},
			]
		: []),
];

export const CourseList = ({
	centerDepartmentId,
	centerId: initialCenterId,
	showDepartmentFilter = false,
	showDepartmentInTable = false,
}: ICoursesListProps) => {
	const ability = useAbility();
	const canCreateCourse = ability.can('create', 'courses');
	const canUpdate = ability.can('update', 'courses');

	const { setPage } = usePaginationParams();

	const [isCreateOpen, openCreate, closeCreate] = useModal();
	const [isViewOpen, openView, closeView] = useModal();
	const [viewCourseId, setViewCourseId] = useState<string | null>(null);

	const handleCloseView = () => {
		closeView();
		setViewCourseId(null);
	};

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

	const [activeFilter, setActiveFilter] = useState(''); // '' = Todos, 'true' = Activo, 'false' = Inactivo

	const effectiveCenterDepartmentId = showDepartmentFilter
		? selectedDepartment || undefined
		: centerDepartmentId;

	const activeStatusParam =
		activeFilter === 'true'
			? true
			: activeFilter === 'false'
				? false
				: undefined;

	const coursesInfo = useSearchCourses(effectiveCenterDepartmentId, debValue, activeStatusParam);

	const allCoursesInfo = useGetAllCourses(showDepartmentFilter, debValue, activeStatusParam);

	const hasFilter = selectedDepartment || searchTerm || activeFilter;

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
		() =>
			createCourseColumns(
				!!showDepartmentInTable,
				canUpdate,
				id => {
					setViewCourseId(id);
					openView();
				}
			),
		[showDepartmentInTable, canUpdate, openView]
	);

	return (
		<div className="space-y-4">
			<div className="grid items-end grid-cols-1 md:grid-cols-4 gap-4">
				<div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							Búsqueda por término
						</label>
						<input
							type="text"
							placeholder="Buscar por código o nombre..."
							value={searchTerm}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setSearchTerm(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						/>
					</div>
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							Estado
						</label>
						<select
							value={activeFilter}
							onChange={e => {
								setActiveFilter(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						>
							<option value="">Todos</option>
							<option value="true">Activo</option>
							<option value="false">Inactivo</option>
						</select>
					</div>
					{showDepartmentFilter && ability.can('read', 'centers') && (
						<CourseDepartmentFilter
							value={selectedDepartment}
							centerId={centerId}
							onChange={setSelectedDepartment}
							onCenterChange={handleCenterChange}
						/>
					)}
				</div>
				<div className={`flex justify-end col-span-1 ${!showDepartmentFilter || !ability.can('read', 'centers') ? 'md:col-start-4' : ''}`}>
					{canCreateCourse && (
						<Button
							onClick={openCreate}
							className="bg-green-500 text-white p-2 hover:bg-green-600 transition"
						>
							<Plus className="size-4 mr-1" />
							Nueva Clase
						</Button>
					)}
				</div>
			</div>

			{isLoading ? (
				<Loading />
			) : hasError ? (
				<Error
					error={
						(hasFilter ? coursesInfo.error : allCoursesInfo.error)
							?.message ?? 'Error al cargar las asignaturas'
					}
				/>
			) : (
				<>
					<div className="bg-card border border-card-border rounded-xl shadow-lg shadow-primary/5 overflow-hidden">
						<ResponsiveTable<CourseWithDepartment>
							columns={columns}
							data={data as CourseWithDepartment[]}
							getRowKey={c => c.id}
							loading={isLoading}
							emptyMessage="No hay asignaturas disponibles"
						/>
					</div>
					<div className="">
						<Pagination totalPages={meta?.lastPage} />
					</div>
				</>
			)}

			<CreateCourseModal isOpen={isCreateOpen} onClose={closeCreate} />

			<CourseViewModal
				isOpen={isViewOpen}
				onClose={handleCloseView}
				courseId={viewCourseId}
			/>
		</div>
	);
};
