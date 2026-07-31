import { PlusIcon } from '@heroicons/react/24/outline';
import { useGetAllDigitalBlackboards } from '@api/digital-blackboards';
import { useAbility } from '@config';
import { Button, ModalBase, useModal } from '@shared';
import { CreateDigitalBlackboardForm } from '../components/CreateDigitalBlackboardForm';
import { DigitalBlackboardsTable } from '../components/DigitalBlackboardsTable';

export const ListDigitalBlackboards = () => {
	const ability = useAbility();
	const canCreate = ability.can('create', 'digital-blackboards');
	const canUpdate = ability.can('update', 'digital-blackboards');
	const canDelete = ability.can('delete', 'digital-blackboards');

	const { data, isLoading, isError } = useGetAllDigitalBlackboards();
	const [isCreateOpen, openCreate, closeCreate] = useModal();

	const dataList = Array.isArray(data) ? data : [];

	return (
		<div className="pb-8 sm:pb-12">
			{/* ENCABEZADO */}
			<div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Gestión de Pizarras Digitales
					</h1>
					<p className="text-muted-foreground mt-1">
						Administración del inventario de pizarras digitales.
					</p>
				</div>

				{canCreate && (
					<Button
						type="button"
						className="w-fit justify-start group bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
						onClick={openCreate}
					>
						<PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
						<span>Nueva Pizarra</span>
					</Button>
				)}
			</div>

			{/* TABLA */}
			{isError ? (
				<p className="text-sm text-red-500">
					Error al cargar las pizarras digitales. Intenta
					nuevamente.
				</p>
			) : (
				<DigitalBlackboardsTable
					data={dataList}
					isLoading={isLoading}
					canUpdate={canUpdate}
					canDelete={canDelete}
				/>
			)}

			{/* MODAL DE CREACIÓN */}
			<ModalBase isOpen={isCreateOpen} onClose={closeCreate}>
				<CreateDigitalBlackboardForm
					onCancel={closeCreate}
					onSuccess={closeCreate}
				/>
			</ModalBase>
		</div>
	);
};
