import { useMemo, useState } from 'react';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CreateAcademicPeriodModal } from '../components/CreateAcademicPeriodModal';
import { EditAcademicPeriodModal } from '../components/EditAcademicPeriodModal';
import { DeleteAcademicPeriodModal } from '../components/DeleteAcademicPeriodModal';
import { useModal, usePaginationParams } from '@shared/hooks';
import { TCurrentAcademicPeriod, useDeleteAcademicPeriod, useGetAcademicPeriods } from '@api/periods';
import { Button, DataTable, IDataTableColumn, Loading } from '@shared/components';
import { ESwalIcons, genericAlert } from '@shared/utils';
import { useAbility } from '@config/lib';

const formatDate = (dateStr: string | undefined) => {
	if (!dateStr) return '—';
	return new Date(dateStr).toLocaleDateString('es-HN', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		timeZone: 'UTC',
	});
};

export const AcademicPeriodsList = () => {
	const [isCreateOpen, openCreate, closeCreate] = useModal();
	const [isEditOpen, openEdit, closeEdit] = useModal();
	const [isDeleteOpen, openDelete, closeDelete] = useModal();
	const [selected, setSelected] = useState<TCurrentAcademicPeriod | null>(null);

	const ability = useAbility();
	const canCreate = ability.can('create', 'periods');
	const canUpdate = ability.can('update', 'periods');
	const canDelete = ability.can('delete', 'periods');

	const { setPage } = usePaginationParams();

	const [yearFilter, setYearFilter] = useState('');
	const [pacFilter, setPacFilter] = useState('');
	const [modalityFilter, setModalityFilter] = useState('');

	const { data: allPeriods } = useGetAcademicPeriods();

	const years = useMemo(() => {
		if (!allPeriods) return [];
		const uniqueYears = [...new Set(allPeriods.map(p => p.year))];
		return uniqueYears.sort((a, b) => b - a);
	}, [allPeriods]);

	const { data: periods, isLoading } = useGetAcademicPeriods(
		yearFilter || undefined,
		pacFilter || undefined,
		modalityFilter || undefined
	);
	const { mutate: deletePeriod, isPending: isDeleting } = useDeleteAcademicPeriod();

	const handleOpenEdit = (period: TCurrentAcademicPeriod) => {
		setSelected(period);
		openEdit();
	};

	const handleOpenDelete = (period: TCurrentAcademicPeriod) => {
		setSelected(period);
		openDelete();
	};

	const handleCloseEdit = () => {
		closeEdit();
		setSelected(null);
	};

	const handleConfirmDelete = () => {
		if (!selected) return;
		deletePeriod(selected.id, {
			onSuccess: () => {
				genericAlert(
					'Periodo académico eliminado con éxito.',
					ESwalIcons.SUCCESS
				);
				closeDelete();
				setSelected(null);
			},
			onError: () => {
				genericAlert(
					'No se pudo eliminar el periodo académico.',
					ESwalIcons.ERROR
				);
			},
		});
	};

	const columns: IDataTableColumn<TCurrentAcademicPeriod>[] = [
		{
			key: 'year',
			header: 'Año',
			className: 'text-gray-800 font-normal p-4',
		},
		{
			key: 'pac',
			header: 'PAC',
			className: 'text-gray-800 font-normal p-4',
		},
		{
			key: 'pac_modality',
			header: 'Modalidad',
			className: 'text-gray-800 font-normal p-4',
		},
		{
			key: 'startDate',
			header: 'Fecha Inicio',
			className: 'text-gray-800 font-normal p-4',
			render: (period: TCurrentAcademicPeriod) => formatDate(period.startDate),
		},
		{
			key: 'endDate',
			header: 'Fecha Fin',
			className: 'text-gray-800 font-normal p-4',
			render: (period: TCurrentAcademicPeriod) => formatDate(period.endDate),
		},
		...(canUpdate || canDelete
			? [
					{
						key: 'actions' as const,
						header: 'Acciones',
						className: 'text-center w-32 p-4',
						render: (period: TCurrentAcademicPeriod) => (
							<div className="flex items-center justify-center gap-3">
								{canUpdate && (
									<button
										onClick={() => handleOpenEdit(period)}
										className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
										title="Editar periodo"
									>
										<PencilSquareIcon className="size-5" />
									</button>
								)}
								{canDelete && (
									<button
										onClick={() => handleOpenDelete(period)}
										className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
										title="Eliminar periodo"
									>
										<TrashIcon className="size-5" />
									</button>
								)}
							</div>
						),
					},
				]
			: []),
	];

	return (
		<div className="pb-6 w-full max-w-7xl mx-auto space-y-4">
			<div className="grid items-end grid-cols-1 md:grid-cols-4 gap-4">
				<div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							Año
						</label>
						<select
							value={yearFilter}
							onChange={e => {
								setYearFilter(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						>
							<option value="">Todos</option>
							{years.map(y => (
								<option key={y} value={y}>
									{y}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							PAC
						</label>
						<select
							value={pacFilter}
							onChange={e => {
								setPacFilter(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						>
							<option value="">Todos</option>
							<option value="1">1</option>
							<option value="2">2</option>
							<option value="3">3</option>
						</select>
					</div>
					<div>
						<label className="block mb-2 font-semibold text-sm text-foreground">
							Modalidad
						</label>
						<select
							value={modalityFilter}
							onChange={e => {
								setModalityFilter(e.target.value);
								setPage(1);
							}}
							className="w-full bg-gray-100 cursor-pointer shadow-md rounded-md px-3 py-2 outline-none border border-input focus:ring-2 focus:ring-primary/20 transition-colors"
						>
							<option value="">Todas</option>
							<option value="Trimestre">Trimestre</option>
							<option value="Semestre">Semestre</option>
						</select>
					</div>
				</div>
				<div className="flex md:justify-end sm:justify-start">
					{canCreate && (
						<Button
							onClick={openCreate}
							className="mt-4 sm:mt-0 bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 px-4 py-2 shadow-xs transition-all duration-300 hover:shadow-md active:scale-95 group"
						>
							<PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
							<span>Nuevo Periodo</span>
						</Button>
					)}
				</div>
			</div>

			{isLoading ? (
				<Loading />
			) : (
				<DataTable<TCurrentAcademicPeriod>
					columns={columns}
					data={periods ?? []}
					getRowKey={period => period.id}
					emptyMessage="No hay periodos académicos registrados."
				/>
			)}

			<CreateAcademicPeriodModal isOpen={isCreateOpen} onClose={closeCreate} />

			<EditAcademicPeriodModal
				isOpen={isEditOpen}
				onClose={handleCloseEdit}
				period={selected}
			/>

			<DeleteAcademicPeriodModal
				isOpen={isDeleteOpen}
				onClose={() => {
					closeDelete();
					setSelected(null);
				}}
				onConfirm={handleConfirmDelete}
				periodTitle={
					selected
						? `PAC ${selected.pac} ${selected.pac_modality} ${selected.year}`
						: undefined
				}
				isPending={isDeleting}
			/>
		</div>
	);
};
