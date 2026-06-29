import { EyeIcon, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { UserView } from './UserView';
import { IResponse } from '@shared/interfaces';
import { TOutputTeacherPosition } from '@api/teachers';
import { useModal } from '@shared/hooks';
import {
	Button,
	DataTable,
	IDataTableColumn,
	ModalBase,
	Pagination,
} from '@shared/components';

interface UsersTableProps {
	isLoading: boolean;
	isError: boolean;
	data: IResponse<TOutputTeacherPosition[]> | null;
	onNavigateToCreate?: () => void;
}

export const UsersTable = ({
	isLoading,
	data,
	onNavigateToCreate,
}: UsersTableProps) => {
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
		{
			key: 'actions',
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
	];

	return (
		<>
			<div className="mt-5">
				<div className="flex justify-center mb-5">
					<Button
						type="button"
						className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
						onClick={onNavigateToCreate}
					>
						<Plus className="size-6" />
						Nuevo usuario
					</Button>
				</div>
				<DataTable
					columns={columns}
					data={data?.data ?? []}
					getRowKey={row => row.id}
					loading={isLoading}
					emptyMessage="No hay usuarios registrados"
					showRowNumber={false}
				/>
				<Pagination totalPages={data?.meta?.lastPage} />
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
