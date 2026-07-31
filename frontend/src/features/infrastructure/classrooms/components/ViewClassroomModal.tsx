import { TClassroom } from '@api/classrooms';
import { useGetAllBuildings } from '@api/buildings';
import { useGetAllRoomTypes } from '@api/room-types';
import { useGetAllConnectivities } from '@api/connectivities';
import { useGetAllAudioEquipments } from '@api/audio-equipments';
import { useGetAllConditions } from '@api/conditions';
import { useGetAllDigitalBlackboards } from '@api/digital-blackboards';
import { Button, ModalBase } from '@shared/components';
import { useModal } from '@shared/hooks';
import { ClassroomAvailabilityModal } from './ClassroomAvailabilityModal';

interface ViewClassroomModalProps {
	isOpen: boolean;
	onClose: () => void;
	classroom: TClassroom;
}

const DetailField = ({
	label,
	value,
}: {
	label: string;
	value?: string | number | null;
}) => (
	<div className="space-y-1">
		<p className="text-sm font-medium text-foreground">{label}</p>
		<p className="text-sm text-gray-800">{value ?? '—'}</p>
	</div>
);

export const ViewClassroomModal = ({
	isOpen,
	onClose,
	classroom,
}: ViewClassroomModalProps) => {
	const [isAvailOpen, openAvail, closeAvail] = useModal();
	const buildings = useGetAllBuildings();
	const roomTypes = useGetAllRoomTypes();
	const connectivities = useGetAllConnectivities();
	const audioEquipments = useGetAllAudioEquipments();
	const conditions = useGetAllConditions();
	const digitalBlackboards = useGetAllDigitalBlackboards();

	const buildingName = buildings.isLoading
		? 'Cargando...'
		: buildings.data?.find(b => b.id === classroom.buildingId)?.name;
	const roomTypeName = roomTypes.isLoading
		? 'Cargando...'
		: roomTypes.data?.find(t => t.id === classroom.roomTypeId)
				?.description;
	const connectivityName = !classroom.connectivityId
		? 'Sin conectividad asignada'
		: connectivities.isLoading
			? 'Cargando...'
			: connectivities.data?.find(
					c => c.id === classroom.connectivityId
				)?.description;
	const audioEquipmentName = !classroom.audioEquipmentId
		? 'Sin equipo de audio asignado'
		: audioEquipments.isLoading
			? 'Cargando...'
			: audioEquipments.data?.find(
					a => a.id === classroom.audioEquipmentId
				)?.description;
	const conditionName = !classroom.conditionId
		? 'Sin condición asignada'
		: conditions.isLoading
			? 'Cargando...'
			: conditions.data?.find(c => c.id === classroom.conditionId)
					?.status;

	const digitalBlackboard = digitalBlackboards.data?.find(
		d => d.id === classroom.digitalBlackboardId
	);
	const digitalBlackboardName = !classroom.digitalBlackboardId
		? 'Sin pizarra digital asignada'
		: digitalBlackboards.isLoading
			? 'Cargando...'
			: digitalBlackboard
				? digitalBlackboard.description?.trim() ||
					`Pizarra digital (${digitalBlackboard.id.slice(0, 8)})`
				: undefined;

	const departmentsNames =
		classroom.departments && classroom.departments.length > 0
			? classroom.departments.map(d => d.name).join(', ')
			: 'Sin departamentos asignados';

	const isVirtual = roomTypeName?.toLowerCase() === 'espacio virtual';
	const isInactive = !classroom.activeStatus;
	const disableAvailability = isVirtual || isInactive;

	return (
		<ModalBase isOpen={isOpen} onClose={onClose} showCloseButton={false}>
			<div className="p-2 max-h-[calc(90vh-6rem)] overflow-auto">
				<h1 className="text-xl font-bold mb-1">Detalle del Aula</h1>
				<div className="flex items-center gap-3 mb-3">
					<p className="text-sm text-gray-500">{classroom.name}</p>
					<span
						className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
							classroom.activeStatus
								? 'bg-green-100 text-green-700'
								: 'bg-red-100 text-red-700'
						}`}
					>
						{classroom.activeStatus ? 'Activa' : 'Inactiva'}
					</span>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<DetailField label="Edificio" value={buildingName} />
					<DetailField label="Tipo de aula" value={roomTypeName} />
					<DetailField
						label="Capacidad máxima"
						value={classroom.maxCapacity}
					/>
					<DetailField
						label="Conectividad"
						value={connectivityName}
					/>
					<DetailField
						label="Equipo de audio"
						value={audioEquipmentName}
					/>
					<DetailField label="Condición" value={conditionName} />
					<DetailField
						label="Pizarra digital"
						value={digitalBlackboardName}
					/>

					<DetailField
						label="Departamentos"
						value={departmentsNames}
					/>

					<DetailField label="Escritorios" value={classroom.desks} />
					<DetailField label="Mesas" value={classroom.tables} />
					<DetailField
						label="Proyectores"
						value={classroom.projectors}
					/>
					<DetailField
						label="Tomacorrientes"
						value={classroom.powerOutlets}
					/>
					<DetailField label="Luces" value={classroom.lights} />
					<DetailField
						label="Pizarras"
						value={classroom.blackboards}
					/>
					<DetailField label="Atriles" value={classroom.lecterns} />
					<DetailField label="Ventanas" value={classroom.windows} />
				</div>

				<div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
					<Button
						type="button"
						variant="outline"
						onClick={openAvail}
						disabled={disableAvailability}
						className={disableAvailability ? 'opacity-50 cursor-not-allowed' : ''}
					>
						Ver disponibilidad
					</Button>
					<Button type="button" variant="outline" onClick={onClose}>
						Cerrar
					</Button>
				</div>
			</div>

			<ClassroomAvailabilityModal
				isOpen={isAvailOpen}
				onClose={closeAvail}
				classroomId={classroom.id}
				classroomName={classroom.name}
			/>
		</ModalBase>
	);
};
