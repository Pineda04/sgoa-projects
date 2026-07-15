import { useGetAirConditioner } from '@api/air-conditioners';
import { Button, Loading, ModalBase, TagError } from '@shared/components';

interface ViewAirConditionerModalProps {
	isOpen: boolean;
	onClose: () => void;
	airConditionerId: string;
}

const DetailField = ({
	label,
	value,
}: {
	label: string;
	value?: string | null;
}) => (
	<div className="space-y-1">
		<p className="text-sm font-medium text-foreground">{label}</p>
		<p className="text-sm text-gray-800">{value || '—'}</p>
	</div>
);

export const ViewAirConditionerModal = ({
	isOpen,
	onClose,
	airConditionerId,
}: ViewAirConditionerModalProps) => {
	const { data: airConditioner, isLoading, isError } = useGetAirConditioner(airConditionerId);

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<h1 className="text-xl font-bold mb-1">Detalle del Aire Acondicionado</h1>
				<p className="text-sm text-gray-500 mb-3">
					{airConditioner?.description ?? 'Sin descripción'}
				</p>

				{isLoading ? (
					<Loading />
				) : isError || !airConditioner ? (
					<TagError />
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<DetailField
								label="Descripción"
								value={airConditioner.description}
							/>
							<DetailField
								label="Marca"
								value={airConditioner.brand?.name}
							/>
							<DetailField
								label="Condición"
								value={airConditioner.condition?.status}
							/>
						</div>

						<hr className="my-4 border-gray-100" />

						<p className="text-sm font-semibold text-foreground mb-3">
							Ubicación
						</p>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<DetailField
								label="Aula"
								value={airConditioner.classroom?.name}
							/>
							<DetailField
								label="Edificio"
								value={airConditioner.classroom?.build?.name}
							/>
							<DetailField
								label="Centro"
								value={airConditioner.classroom?.build?.center?.name}
							/>
						</div>
					</>
				)}

				<div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
					<Button type="button" variant="outline" onClick={onClose}>
						Cerrar
					</Button>
				</div>
			</div>
		</ModalBase>
	);
};
