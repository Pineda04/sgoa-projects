import { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
	BuildingOffice2Icon,
	CalendarDaysIcon,
	InboxIcon,
	PencilSquareIcon,
	TvIcon,
	WifiIcon,
	Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { ArrowLeft, Snowflake } from 'lucide-react';
import { useGetClassroomById } from '@api/classrooms';
import { useGetAllBuildings } from '@api/buildings';
import { useGetAllRoomTypes } from '@api/room-types';
import { useGetAllConnectivities } from '@api/connectivities';
import { useGetAllAudioEquipments } from '@api/audio-equipments';
import { useGetAllConditions } from '@api/conditions';
import { useGetDigitalBlackboard } from '@api/digital-blackboards';
import { useGetAllBrands } from '@api/brands';
import { useGetAllMonitorTypes, useGetAllMonitorSizes } from '@api/pc-equipments';
import { useGetAirConditioners } from '@api/air-conditioners';
import { useAbility, cn } from '@config';
import { Button, Loading, TagError } from '@shared/components';
import { useModal } from '@shared/hooks';
import { ClassroomAvailabilityModal } from '../components';

const SectionCard = ({
	title,
	icon,
	action,
	children,
	className,
}: {
	title: string;
	icon: ReactNode;
	action?: ReactNode;
	children: ReactNode;
	className?: string;
}) => (
	<div
		className={cn(
			'rounded-xl border border-card-border bg-card p-5 sm:p-6 shadow-sm',
			className
		)}
	>
		<div className="flex items-center justify-between gap-3 mb-4">
			<div className="flex items-center gap-2.5">
				<div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
					{icon}
				</div>
				<h2 className="text-base font-semibold text-foreground">
					{title}
				</h2>
			</div>
			{action}
		</div>
		{children}
	</div>
);

const InfoField = ({
	label,
	value,
}: {
	label: string;
	value?: ReactNode;
}) => (
	<div className="min-w-0">
		<p className="text-xs font-medium text-muted-foreground mb-1">
			{label}
		</p>
		<div className="text-sm font-medium text-foreground">
			{value ?? <span className="text-muted-foreground">—</span>}
		</div>
	</div>
);

const StatTile = ({ label, value }: { label: string; value: number }) => (
	<div className="rounded-lg bg-muted/40 border border-border/50 p-3 text-center">
		<p className="text-xl font-bold text-foreground">{value}</p>
		<p className="text-xs text-muted-foreground mt-0.5">{label}</p>
	</div>
);

export const ViewClassroom = () => {
	const { id = '' } = useParams();
	const navigate = useNavigate();
	const ability = useAbility();
	const canUpdate = ability.can('update', 'classrooms');

	const [isAvailOpen, openAvail, closeAvail] = useModal();

	const {
		data: classroom,
		isLoading,
		isError,
	} = useGetClassroomById(id);

	const buildings = useGetAllBuildings();
	const roomTypes = useGetAllRoomTypes();
	const connectivities = useGetAllConnectivities();
	const audioEquipments = useGetAllAudioEquipments();
	const conditions = useGetAllConditions();
	const brands = useGetAllBrands();
	const monitorTypes = useGetAllMonitorTypes();
	const monitorSizes = useGetAllMonitorSizes();
	const airConditioners = useGetAirConditioners();

	const digitalBlackboard = useGetDigitalBlackboard(
		classroom?.digitalBlackboardId ?? ''
	);

	if (isLoading) return <Loading />;
	if (isError || !classroom) {
		return <TagError text="No se encontró el aula solicitada." />;
	}

	const building = buildings.data?.find(b => b.id === classroom.buildingId);
	const roomType = roomTypes.data?.find(t => t.id === classroom.roomTypeId);
	const connectivity = classroom.connectivityId
		? connectivities.data?.find(c => c.id === classroom.connectivityId)
		: undefined;
	const audioEquipment = classroom.audioEquipmentId
		? audioEquipments.data?.find(a => a.id === classroom.audioEquipmentId)
		: undefined;
	const condition = classroom.conditionId
		? conditions.data?.find(c => c.id === classroom.conditionId)
		: undefined;

	const classroomAirConditioners =
		airConditioners.data?.filter(
			ac => ac.classroom?.id === classroom.id
		) ?? [];

	const digitalBlackboardBrand = digitalBlackboard.data
		? brands.data?.find(b => b.id === digitalBlackboard.data.brandId)
		: undefined;
	const digitalBlackboardMonitorType = digitalBlackboard.data
		? monitorTypes.data?.find(
				t => t.id === digitalBlackboard.data.monitorTypeId
			)
		: undefined;
	const digitalBlackboardMonitorSize = digitalBlackboard.data
		? monitorSizes.data?.find(
				s => s.id === digitalBlackboard.data.monitorSizeId
			)
		: undefined;
	const digitalBlackboardCondition = digitalBlackboard.data
		? conditions.data?.find(c => c.id === digitalBlackboard.data.conditionId)
		: undefined;

	const isVirtual = roomType?.description?.toLowerCase() === 'espacio virtual';
	const isInactive = !classroom.activeStatus;
	const disableAvailability = isVirtual || isInactive;

	const physicalResources = [
		{ label: 'Escritorios', value: classroom.desks },
		{ label: 'Mesas', value: classroom.tables },
		{ label: 'Proyectores', value: classroom.projectors },
		{ label: 'Tomacorrientes', value: classroom.powerOutlets },
		{ label: 'Luces', value: classroom.lights },
		{ label: 'Pizarras', value: classroom.blackboards },
		{ label: 'Atriles', value: classroom.lecterns },
		{ label: 'Ventanas', value: classroom.windows },
	];

	return (
		<div className="pb-8 sm:pb-12 max-w-6xl mx-auto">
			<article className="bg-card border border-card-border rounded-xl shadow-lg shadow-primary/5 overflow-hidden">
				<header className="border-b border-card-border px-5 sm:px-8 py-5 sm:py-6">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="min-w-0">
							<div className="flex items-center gap-2.5 flex-wrap">
								<h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
									{classroom.name}
								</h1>
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
							<p className="text-sm text-muted-foreground mt-1 truncate">
								{building?.name ?? 'Sin edificio'}
								{roomType?.description
									? ` • ${roomType.description}`
									: ''}
							</p>
						</div>

						<div className="flex items-center gap-2 flex-wrap shrink-0">
							<Button
								type="button"
								variant="outline"
								onClick={() => navigate(-1)}
							>
								<ArrowLeft className="size-4" />
								Volver
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={openAvail}
								disabled={disableAvailability}
								className={
									disableAvailability
										? 'opacity-50 cursor-not-allowed'
										: ''
								}
							>
								<CalendarDaysIcon className="size-4" />
								Ver disponibilidad
							</Button>
							{canUpdate && (
								<Button
									type="button"
									onClick={() =>
										navigate(
											`/infrastructure/classrooms/edit/${classroom.id}`
										)
									}
								>
									<PencilSquareIcon className="size-4" />
									Editar
								</Button>
							)}
						</div>
					</div>
				</header>

				<div className="p-5 sm:p-8 space-y-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 space-y-6">
							<SectionCard
								title="Información general"
								icon={<BuildingOffice2Icon className="size-4.5" />}
							>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<InfoField label="Edificio" value={building?.name} />
									<InfoField
										label="Tipo de aula"
										value={roomType?.description}
									/>
									<InfoField
										label="Capacidad máxima"
										value={
											classroom.maxCapacity != null
												? `${classroom.maxCapacity} personas`
												: undefined
										}
									/>
									<InfoField
										label="Condición general"
										value={condition?.status}
									/>
									<div className="sm:col-span-2">
										<InfoField
											label="Departamentos"
											value={
												classroom.departments &&
												classroom.departments.length > 0 ? (
													<div className="flex flex-wrap gap-1.5 mt-0.5">
														{classroom.departments.map(d => (
															<span
																key={d.id}
																className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium text-foreground"
															>
																{d.name}
															</span>
														))}
													</div>
												) : undefined
											}
										/>
									</div>
								</div>
							</SectionCard>

							<SectionCard
								title="Recursos físicos"
								icon={<Squares2X2Icon className="size-4.5" />}
							>
								<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
									{physicalResources.map(r => (
										<StatTile
											key={r.label}
											label={r.label}
											value={r.value}
										/>
									))}
								</div>
							</SectionCard>

							<SectionCard
								title="Conectividad y equipamiento"
								icon={<WifiIcon className="size-4.5" />}
							>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<InfoField
										label="Conectividad"
										value={connectivity?.description}
									/>
									<InfoField
										label="Equipo de audio"
										value={audioEquipment?.description}
									/>
								</div>
							</SectionCard>
						</div>

						<div className="space-y-6">
							<SectionCard
								title="Pizarra digital"
								icon={<TvIcon className="size-4.5" />}
							>
								{!classroom.digitalBlackboardId ? (
									<EmptyState text="Sin pizarra digital asignada" />
								) : digitalBlackboard.isLoading ? (
									<p className="text-sm text-muted-foreground">
										Cargando...
									</p>
								) : !digitalBlackboard.data ? (
									<EmptyState text="No se pudo cargar la pizarra digital" />
								) : (
									<div className="space-y-4">
										<InfoField
											label="Descripción"
											value={
												digitalBlackboard.data.description?.trim() ||
												undefined
											}
										/>
										<InfoField
											label="Marca"
											value={digitalBlackboardBrand?.name}
										/>
										<InfoField
											label="Tipo de monitor"
											value={digitalBlackboardMonitorType?.description}
										/>
										<InfoField
											label="Tamaño"
											value={digitalBlackboardMonitorSize?.description}
										/>
										<InfoField
											label="Condición"
											value={digitalBlackboardCondition?.status}
										/>
									</div>
								)}
							</SectionCard>

							<SectionCard
								title="Aire acondicionado"
								icon={<Snowflake className="size-4.5" />}
							>
								{airConditioners.isLoading ? (
									<p className="text-sm text-muted-foreground">
										Cargando...
									</p>
								) : airConditioners.isError ? (
									<EmptyState text="No se pudieron cargar los aires acondicionados" />
								) : classroomAirConditioners.length === 0 ? (
									<EmptyState text="Sin aires acondicionados asignados" />
								) : (
									<div className="space-y-3">
										{classroomAirConditioners.map(ac => (
											<div
												key={ac.id}
												className="rounded-lg border border-border/60 bg-muted/30 p-3"
											>
												<p className="text-sm font-semibold text-foreground">
													{ac.description?.trim() ||
														`Aire acondicionado (${ac.id.slice(0, 8)})`}
												</p>
												<div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-muted-foreground">
													<span>
														Marca:{' '}
														<span className="font-medium text-foreground">
															{ac.brand?.name ?? '—'}
														</span>
													</span>
													<span>
														Condición:{' '}
														<span className="font-medium text-foreground">
															{ac.condition?.status ?? '—'}
														</span>
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</SectionCard>
						</div>
					</div>
				</div>
			</article>

			<ClassroomAvailabilityModal
				isOpen={isAvailOpen}
				onClose={closeAvail}
				classroomId={classroom.id}
				classroomName={classroom.name}
			/>
		</div>
	);
};

const EmptyState = ({ text }: { text: string }) => (
	<div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
		<InboxIcon className="size-6 text-muted-foreground/40" />
		<p className="text-sm text-muted-foreground">{text}</p>
	</div>
);
