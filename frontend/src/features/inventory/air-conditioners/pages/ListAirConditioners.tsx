import { useGetAirConditioners } from '@api/air-conditioners';
import { useAbility } from '@config/lib/casl/ability';
import { Button, ModalBase, useModal } from '@shared';
import { AirConditionersTable } from '../components/AirConditionersTable';
import { CreateAirConditionerForm } from '../components/CreateAirConditionerForm';

export const ListAirConditioners = () => {
	const ability = useAbility();
	const { data, isLoading } = useGetAirConditioners();
	const [isCreateOpen, openCreate, closeCreate] = useModal();

	const canCreate = ability.can('create', 'airConditioners') || ability.can('manage', 'airConditioners');
	const canUpdate = ability.can('update', 'airConditioners') || ability.can('manage', 'airConditioners');
	const canDelete = ability.can('delete', 'airConditioners') || ability.can('manage', 'airConditioners');

	const handleCreateSuccess = () => {
		closeCreate();
	};

	return (
		<div className="pb-8 sm:pb-12">
			{/* Encabezado y botón de creación */}
			<div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
				{/* Info de la página */}
				<div>
					<h1 className="text-2xl font-bold text-foreground">
						Gestión de Aires Acondicionados
					</h1>
					<p className="text-muted-foreground mt-1">
						Administración del inventario de aires acondicionados.
					</p>
				</div>

				{/* Botón condicionado de crear aire acondicionado */}
				{canCreate && (
					<Button
						onClick={openCreate}
						className="w-fit justify-start bg-green-500 text-white p-2 hover:bg-green-600 transition flex flex-row duration-500"
						variant="unstyled"
					>
						+ Nuevo Aire Acondicionado
					</Button>
				)}
			</div>

			{/* Tabla */}
			<AirConditionersTable
				data={data ?? []}
				isLoading={isLoading}
				canUpdate={canUpdate}
				canDelete={canDelete}
			/>

			{/* Modal de creación */}
			<ModalBase isOpen={isCreateOpen} onClose={closeCreate}>
				<CreateAirConditionerForm
					onCancel={closeCreate}
					onSuccess={handleCreateSuccess}
				/>
			</ModalBase>
		</div>
	);
};
