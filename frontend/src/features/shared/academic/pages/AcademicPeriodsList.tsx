import { useState } from 'react';
import { Button } from '@components/ui/button';
import { Loading } from '@components';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { DataTable } from '@components/ui/DataTable';
import type { IDataTableColumn } from '@components/ui/DataTable';
import { useModal } from '@hooks';
import { ESwalIcons, genericAlert } from '@utils';
import { useGetAcademicPeriods } from '../hooks/queries';
import { useDeleteAcademicPeriod } from '../hooks/mutations';
import type { TCurrentAcademicPeriod } from '../types';
import { CreateAcademicPeriodModal } from '../components/CreateAcademicPeriodModal';
import { EditAcademicPeriodModal } from '../components/EditAcademicPeriodModal';
import { DeleteAcademicPeriodModal } from '../components/DeleteAcademicPeriodModal';

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

	const { data: periods, isLoading } = useGetAcademicPeriods();
	const { mutate: deletePeriod, isPending: isDeleting } = useDeleteAcademicPeriod();

	if (isLoading) return <Loading />;

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
		{
			key: 'actions',
			header: 'Acciones',
			className: 'text-center w-32 p-4',
			render: (period: TCurrentAcademicPeriod) => (
				<div className="flex items-center justify-center gap-3">
					<button
						onClick={() => handleOpenEdit(period)}
						className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
						title="Editar periodo"
					>
						<PencilSquareIcon className="size-5" />
					</button>
					<button
						onClick={() => handleOpenDelete(period)}
						className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
						title="Eliminar periodo"
					>
						<TrashIcon className="size-5" />
					</button>
				</div>
			),
		},
	];

	return (
		<div className="p-6 w-full max-w-7xl mx-auto">
			<div className="flex flex-col sm:flex-row justify-between items-center mb-6">
				<div>
					<h1 className="text-2xl font-bold text-slate-800">
						Gestión de Periodos Académicos
					</h1>
					<p className="text-sm text-gray-500 mt-2">
						Administración de periodos académicos de la institución.
					</p>
				</div>
				<Button
					onClick={openCreate}
					className="mt-4 sm:mt-0 bg-[oklch(0.627_0.194_149.214)] hover:bg-[oklch(0.55_0.194_149.214)] text-white flex items-center gap-2 px-4 py-2 rounded-md font-medium shadow-xs transition-all duration-300 hover:shadow-md active:scale-95 group"
					variant="unstyled"
				>
					<PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
					<span>Nuevo Periodo</span>
				</Button>
			</div>

			<DataTable<TCurrentAcademicPeriod>
				columns={columns}
				data={periods ?? []}
				getRowKey={period => period.id}
				emptyMessage="No hay periodos académicos registrados."
			/>

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
				periodTitle={selected?.title}
				isPending={isDeleting}
			/>
		</div>
	);
};
