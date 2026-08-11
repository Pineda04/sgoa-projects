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
	scrollable = false,
}: {
	label: string;
	value?: string | null;
	scrollable?: boolean;
}) => (
	<div className="space-y-2">
		<label className="text-sm font-medium text-foreground">{label}</label>
		<input
			type="text"
			value={value || '—'}
			disabled={!scrollable}
			readOnly
			className={`w-full h-10 px-3 bg-muted border border-border rounded-lg text-sm text-muted-foreground ${scrollable ? 'cursor-text' : ''}`}
		/>
	</div>
);

export const ViewAirConditionerModal = ({
	isOpen,
	onClose,
	airConditionerId,
}: ViewAirConditionerModalProps) => {
	const {
		data: airConditioner,
		isLoading,
		isError,
	} = useGetAirConditioner(airConditionerId);

	return (
		<ModalBase isOpen={isOpen} onClose={onClose}>
			<div className="p-2">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mr-7 mb-1">
					<div className="min-w-0">
						<h1 className="text-xl font-bold text-slate-800 truncate">
							Detalle del Aire Acondicionado
						</h1>
						{!isLoading && (
							<p className="text-xs text-gray-500 truncate">
								{airConditioner?.brand?.name ?? 'Sin marca'}
							</p>
						)}
					</div>
				</div>
				<hr className="h-px my-3 bg-gray-100 border-0" />

				{isLoading ? (
					<Loading />
				) : isError || !airConditioner ? (
					<TagError />
				) : (
					<>
						<DetailField
							label="Descripción"
							value={airConditioner.description}
							scrollable
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
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
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
								value={
									airConditioner.classroom?.build?.center
										?.name
								}
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
