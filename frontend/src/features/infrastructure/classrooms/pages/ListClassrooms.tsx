import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	EyeIcon,
	PencilSquareIcon,
	PlusIcon,
	TrashIcon,
} from '@heroicons/react/24/outline';
import {
	TClassroom,
	useDeleteClassroomMutation,
	useGetAllClassrooms,
} from '@api/classrooms';
import { useGetAllBuildings } from '@api/buildings';
import { useGetAllRoomTypes } from '@api/room-types';
import { useAbility } from '@config';
import {
	Button,
	DataTable,
	IDataTableColumn,
	Pagination,
} from '@shared/components';
import { useDebounce, useModal, usePaginationParams } from '@shared/hooks';
import { DeleteClassroomModal, ViewClassroomModal } from '../components';

export const ListClassrooms = () => {
	const navigate = useNavigate();
	const ability = useAbility();
	const canCreate = ability.can('create', 'classrooms');
	const canUpdate = ability.can('update', 'classrooms');
	const canDelete = ability.can('delete', 'classrooms');

	const buildings = useGetAllBuildings();
	const roomTypes = useGetAllRoomTypes();

	const [isDeleteOpen, openDelete, closeDelete] = useModal();
	const [isViewOpen, openView, closeView] = useModal();
	const [selectedClassroom, setSelectedClassroom] =
		useState<TClassroom | null>(null);

	const { deleteClassroom, isPendingDelete } = useDeleteClassroomMutation();

	const { setPage } = usePaginationParams();

	const [searchTerm, setSearchTerm] = useState('');
	const { debouncedValue: debouncedSearch } = useDebounce(searchTerm, 500);
	const [buildingFilter, setBuildingFilter] = useState('');
	const [roomTypeFilter, setRoomTypeFilter] = useState('');
	const [statusFilter, setStatusFilter] = useState('');

	const classrooms = useGetAllClassrooms({
		name: debouncedSearch || undefined,
		buildingId: buildingFilter || undefined,
		roomTypeId: roomTypeFilter || undefined,
		activeStatus: statusFilter || undefined,
	});

	const buildingMap = useMemo(
		() => new Map(buildings.data?.map(b => [b.id, b.name])),
		[buildings.data]
	);
	const roomTypeMap = useMemo(
		() => new Map(roomTypes.data?.map(t => [t.id, t.description])),
		[roomTypes.data]
	);

	const handleOpenView = (classroom: TClassroom) => {
		setSelectedClassroom(classroom);
		openView();
	};

	const handleCloseView = () => closeView();

	const handleOpenDelete = (classroom: TClassroom) => {
		setSelectedClassroom(classroom);
		openDelete();
	};

	const handleCloseDelete = () => {
		closeDelete();
		setSelectedClassroom(null);
	};

	const handleConfirmDelete = async () => {
		if (!selectedClassroom) return;
		try {
			await deleteClassroom(selectedClassroom.id);
			handleCloseDelete();
		} catch {
			// Error handling done en la mutation
		}
	};

	const columns: IDataTableColumn<TClassroom>[] = [
		{
			key: 'name',
			header: 'Nombre',
			mobileLabel: 'Nombre',
		},
		{
			key: 'buildingId',
			header: 'Edificio',
			mobileLabel: 'Edificio',
			render: row => buildingMap.get(row.buildingId) ?? '—',
		},
		{
			key: 'roomTypeId',
			header: 'Tipo',
			mobileLabel: 'Tipo',
			render: row => roomTypeMap.get(row.roomTypeId) ?? '—',
		},
		{
			key: 'maxCapacity',
			header: 'Capacidad',
			mobileLabel: 'Capacidad',
			render: row => row.maxCapacity ?? '—',
		},
		{
			key: 'furniture',
			header: 'Inmobiliario',
			mobileLabel: 'Inmobiliario',
			hiddenOnMobile: true,
			render: row =>
				`${row.desks} escritorios · ${row.tables} mesas · ${row.blackboards} pizarras`,
		},
		{
			key: 'activeStatus',
			header: 'Estado',
			mobileLabel: 'Estado',
			render: row => (
				<span
					className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
						row.activeStatus
							? 'bg-green-100 text-green-700'
							: 'bg-red-100 text-red-700'
					}`}
				>
					{row.activeStatus ? 'Activa' : 'Inactiva'}
				</span>
			),
		},
		{
			key: 'actions',
			header: 'Acciones',
			mobileLabel: 'Acciones',
			render: row => (
				<div className="flex items-center justify-center gap-3">
					<button
						onClick={() => handleOpenView(row)}
						className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
						title="Ver aula"
					>
						<EyeIcon className="size-5" />
					</button>
					{canUpdate && (
						<button
							onClick={() =>
								navigate(
									`/infrastructure/classrooms/edit/${row.id}`
								)
							}
							className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
							title="Editar aula"
						>
							<PencilSquareIcon className="size-5" />
						</button>
					)}
					{canDelete && (
						<button
							onClick={() => handleOpenDelete(row)}
							className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
							title="Eliminar aula"
						>
							<TrashIcon className="size-5" />
						</button>
					)}
				</div>
			),
		},
	];

	return (
		<div className="pb-8 sm:pb-12">
			<div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Gestión de Aulas
					</h1>
					<p className="text-muted-foreground mt-1">
						Administración de las aulas y sus recursos físicos.
					</p>
				</div>

				{canCreate && (
					<Button
						type="button"
						className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
						onClick={() =>
							navigate('/infrastructure/classrooms/new')
						}
					>
						<PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
						<span>Nueva aula</span>
					</Button>
				)}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<div>
					<label className="block mb-2 font-semibold text-sm text-foreground">
						Búsqueda por nombre
					</label>
					<input
						type="text"
						placeholder="Buscar aula..."
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
						Edificio
					</label>
					<select
						value={buildingFilter}
						onChange={e => {
							setBuildingFilter(e.target.value);
							setPage(1);
						}}
						className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
					>
						<option value="">Todos los edificios</option>
						{buildings.data?.map(b => (
							<option key={b.id} value={b.id}>
								{b.name}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block mb-2 font-semibold text-sm text-foreground">
						Tipo de aula
					</label>
					<select
						value={roomTypeFilter}
						onChange={e => {
							setRoomTypeFilter(e.target.value);
							setPage(1);
						}}
						className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
					>
						<option value="">Todos los tipos</option>
						{roomTypes.data?.map(t => (
							<option key={t.id} value={t.id}>
								{t.description}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="block mb-2 font-semibold text-sm text-foreground">
						Estado
					</label>
					<select
						value={statusFilter}
						onChange={e => {
							setStatusFilter(e.target.value);
							setPage(1);
						}}
						className="w-full bg-gray-100 shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
					>
						<option value="">Todos</option>
						<option value="true">Activa</option>
						<option value="false">Inactiva</option>
					</select>
				</div>
			</div>

			{classrooms.isError ? (
				<p className="text-sm text-red-500">
					Error al cargar las aulas. Intenta nuevamente.
				</p>
			) : (
				<>
					<DataTable<TClassroom>
						columns={columns}
						data={classrooms.data?.data ?? []}
						getRowKey={row => row.id}
						loading={classrooms.isLoading}
						emptyMessage="No hay aulas registradas"
						showRowNumber={false}
					/>
					<Pagination totalPages={classrooms.data?.meta?.lastPage} />
				</>
			)}

			{selectedClassroom && (
				<ViewClassroomModal
					isOpen={isViewOpen}
					onClose={handleCloseView}
					classroom={selectedClassroom}
				/>
			)}

			<DeleteClassroomModal
				isOpen={isDeleteOpen}
				onClose={handleCloseDelete}
				onConfirm={handleConfirmDelete}
				classroomName={selectedClassroom?.name}
				isPending={isPendingDelete}
			/>
		</div>
	);
};
