import { EyeIcon, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { UserView } from './UserView';
import { TOutputTeacherPosition, useGetAllTeacherCategories, useGetTeachers, useGetTeachersCoordinator } from '@api/teachers';
import { useGetAllContractTypes } from '@api/contract-types';
import { useDebounce, useModal, usePaginationParams } from '@shared/hooks';
import {
	Button,
	DataTable,
	IDataTableColumn,
	ModalBase,
	Pagination,
} from '@shared/components';
import { useAbility } from '@config';

interface UsersTableProps {
	onNavigateToCreate?: () => void;
	centerDepartmentId?: string;
}

export const UsersTable = ({
	onNavigateToCreate,
	centerDepartmentId,
}: UsersTableProps) => {
	const ability = useAbility();
	const canCreate = ability.can('create', 'users');
	const canRead = ability.can('read', 'users');

	const { setPage } = usePaginationParams();

	const [searchTerm, setSearchTerm] = useState('');
	const { debouncedValue: debouncedSearch } = useDebounce(searchTerm, 500);
	const [categoryFilter, setCategoryFilter] = useState('');
	const [contractTypeFilter, setContractTypeFilter] = useState('');

	const filterParams = {
		searchTerm: debouncedSearch || undefined,
		categoryId: categoryFilter || undefined,
		contractTypeId: contractTypeFilter || undefined,
	};

	const teachersQuery = useGetTeachers(filterParams, { enabled: !centerDepartmentId });
	const teachersCoordinatorQuery = useGetTeachersCoordinator(centerDepartmentId ?? '', filterParams);

	const { data, isLoading, isError } = centerDepartmentId
		? teachersCoordinatorQuery
		: teachersQuery;

	const categories = useGetAllTeacherCategories();
	const contractTypes = useGetAllContractTypes();

	const [
		showModalUpdateUser,
		handleShowModalUpdateUser,
		handleCloseModalUpdateUser,
	] = useModal();

	const [userInfo, setUserInfo] = useState<TOutputTeacherPosition>();

	const handleSelectedUser = useCallback(
		(data: TOutputTeacherPosition) => {
			setUserInfo(data);
			handleShowModalUpdateUser();
		},
		[handleShowModalUpdateUser]
	);

	const updateUserInfo = useMemo(() => {
		if (userInfo && data) {
			const user = data.data.find(u => u.userId === userInfo.userId);
			return user || userInfo;
		}
		return userInfo;
	}, [data, userInfo]);

	const columns: IDataTableColumn<TOutputTeacherPosition>[] = [
		{ key: 'code', header: 'Código', mobileLabel: 'Cod.' },
		{ key: 'name', header: 'Nombre', mobileLabel: 'Nombre' },
		{
			key: 'undergrads',
			header: 'Pregrado',
			mobileLabel: 'Pregrado',
			hiddenOnMobile: true,
			render: (row: TOutputTeacherPosition) =>
				row.undergrads.length !== 0 ? row.undergrads[0].name : '—',
		},
		{
			key: 'postgrads',
			header: 'Posgrado',
			mobileLabel: 'Posgrado',
			hiddenOnMobile: true,
			render: (row: TOutputTeacherPosition) =>
				row.postgrads.length !== 0 ? row.postgrads[0].name : '—',
		},
		{
			key: 'categoryName',
			header: 'Categoría',
			mobileLabel: 'Categoría',
			hiddenOnMobile: true,
		},
		{
			key: 'contractTypeName',
			header: 'Contratación',
			mobileLabel: 'Contrato',
			hiddenOnMobile: true,
		},
		...(canRead
			? [
					{
						key: 'actions' as const,
						header: 'Acciones',
						mobileLabel: 'Acciones',
						render: (row: TOutputTeacherPosition) => (
							<Button
								onClick={() => handleSelectedUser(row)}
								className="cursor-pointer"
								variant="unstyled"
							>
								<EyeIcon className="size-5 text-[#1C64B4] hover:text-[#144C74]" />
							</Button>
						),
					},
				]
			: []),
	];

	return (
		<>
      <div className="">
			<div className="grid items-end grid-cols-1 md:grid-cols-4 gap-4 mb-5">
					<div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div>
							<label className="block mb-2 font-semibold text-sm text-foreground">
								Búsqueda por nombre o código
							</label>
							<input
								type="text"
								placeholder="Buscar usuario..."
								value={searchTerm}
								onChange={e => {
									setSearchTerm(e.target.value);
									setPage(1);
								}}
								className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
							/>
						</div>
						<div>
							<label className="block mb-2 font-semibold text-sm text-foreground">
								Categoría
							</label>
							<select
								value={categoryFilter}
								onChange={e => {
									setCategoryFilter(e.target.value);
									setPage(1);
								}}
								className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
							>
								<option value="">Todas las categorías</option>
								{categories.data?.map(c => (
									<option key={c.id} value={c.id}>
										{c.name}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="block mb-2 font-semibold text-sm text-foreground">
								Contratación
							</label>
							<select
								value={contractTypeFilter}
								onChange={e => {
									setContractTypeFilter(e.target.value);
									setPage(1);
								}}
								className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
							>
								<option value="">Todos los tipos</option>
								{contractTypes.data?.map(t => (
									<option key={t.id} value={t.id}>
										{t.name}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="flex justify-center md:justify-end">
						{canCreate && (
							<Button
								type="button"
								className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
								onClick={onNavigateToCreate}
							>
								<Plus className="size-6" />
								Nuevo usuario
							</Button>
						)}
					</div>
				</div>
				{isError ? (
					<p className="text-sm text-red-500">
						Error al cargar los usuarios. Intenta nuevamente.
					</p>
				) : (
					<>
						<DataTable
							columns={columns}
							data={data?.data ?? []}
							getRowKey={row => row.id}
							loading={isLoading}
							emptyMessage="No hay usuarios registrados"
							showRowNumber={false}
						/>
						<Pagination totalPages={data?.meta?.lastPage} />
					</>
				)}
			</div>
			{updateUserInfo && (
				<ModalBase
					isOpen={showModalUpdateUser}
					onClose={handleCloseModalUpdateUser}
				>
					<UserView initialData={updateUserInfo} isModal />
				</ModalBase>
			)}
		</>
	);
};
