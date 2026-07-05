import { PlusIcon } from '@heroicons/react/24/outline';
import { useGetPcEquipments } from '@api/pc-equipments';
import { useAbility } from '@config';
import { Button, ModalBase, Pagination } from '@shared/components';
import { useModal } from '@shared/hooks';
import { CreatePcEquipmentForm, PcEquipmentsTable } from '../components';

export const ListPcEquipments = () => {
	const ability = useAbility();
	const canCreate = ability.can('create', 'pcEquipments');
	const canUpdate = ability.can('update', 'pcEquipments');
	const canDelete = ability.can('delete', 'pcEquipments');

	const pcEquipments = useGetPcEquipments();

	const [isCreateOpen, openCreate, closeCreate] = useModal();

	return (
		<div className="pb-8 sm:pb-12">
			<div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Gestión de Computadoras
					</h1>
					<p className="text-muted-foreground mt-1">
						Administración del inventario de equipos de cómputo.
					</p>
				</div>

				{canCreate && (
					<Button
						type="button"
						className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
						onClick={openCreate}
					>
						<PlusIcon className="size-5 transition-transform duration-300 group-hover:rotate-90" />
						<span>Nuevo equipo</span>
					</Button>
				)}
			</div>

			{pcEquipments.isError ? (
				<p className="text-sm text-red-500">
					Error al cargar los equipos de cómputo. Intenta nuevamente.
				</p>
			) : (
				<>
					<PcEquipmentsTable
						data={pcEquipments.data?.data ?? []}
						isLoading={pcEquipments.isLoading}
						canUpdate={canUpdate}
						canDelete={canDelete}
					/>
					<Pagination
						totalPages={pcEquipments.data?.meta?.lastPage}
					/>
				</>
			)}

			<ModalBase isOpen={isCreateOpen} onClose={closeCreate}>
				<CreatePcEquipmentForm
					onCancel={closeCreate}
					onSuccess={closeCreate}
				/>
			</ModalBase>
		</div>
	);
};
