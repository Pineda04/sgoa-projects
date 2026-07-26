import { useMemo, useState } from 'react';
import {
	ClipboardList,
	Tag,
	DoorOpen,
	Wifi,
	Monitor,
	Tv,
	Computer,
	FileText,
	SquareUser,
	Clock,
	Headphones,
} from 'lucide-react';
import { queryClient } from '@config/lib';
import { type Subjects } from '@config/lib';
import { CatalogCard, CatalogCrudModal } from '../components';
import { Square2StackIcon } from '@heroicons/react/24/outline';
import {
	useGetAllContractTypes,
	contractTypesApi,
	contractTypesKeys,
} from '@api/contract-types';
import { useGetAllBrands, brandsApi, brandsKeys } from '@api/brands';
import {
	useGetAllConditions,
	conditionsApi,
	conditionsKeys,
} from '@api/conditions';
import {
	useGetAllRoomTypes,
	roomTypesApi,
	roomTypesKeys,
} from '@api/room-types';
import {
	useGetAllConnectivities,
	connectivitiesApi,
	connectivitiesKeys,
} from '@api/connectivities';
import {
	teacherCategoriesApi,
	teacherCategoriesKeys,
	useGetAllTeacherCategories,
} from '@api/teachers';
import {
	useGetAllPcTypes,
	useGetAllMonitorTypes,
	useGetAllMonitorSizes,
	pcTypesApi,
	monitorTypesApi,
	monitorSizesApi,
	pcTypesKeys,
	monitorTypesKeys,
	monitorSizesKeys,
} from '@api/pc-equipments';
import {
	useGetAllShifts,
	shiftsApi,
	shiftsKeys,
} from '@api/shifts';
import {
	useGetAllAudioEquipments,
	audioEquipmentsApi,
	audioEquipmentsKeys,
} from '@api/audio-equipments';

type EntityConfig = {
	fieldKey: string;
	data: Array<{ id: string; [key: string]: string }> | undefined;
	isLoading: boolean;
	onSave: (
		createItems: Array<{ value: string }>,
		updateItems: Array<{ id: string; value: string }>,
		deleteIds: string[]
	) => Promise<{ createdIds: string[] }>;
};

const entitySubjects = new Set<string>([
	'teacher-categories',
	'contract-types',
	'shifts',
	'brands',
	'conditions',
	'connectivities',
	'room-types',
	'pc-types',
	'monitor-types',
	'monitor-sizes',
	'audio-equipments',
]);

const configItems = [
	{
		key: 'teacher-categories',
		icon: <SquareUser className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Categorías de Docentes',
		description: 'Gestión de categorías de docentes',
	},
	{
		key: 'contract-types',
		icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Tipos de Contratación',
		description: 'Gestión de tipos de contrato',
	},
	{
		key: 'shifts',
		icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Jornadas',
		description: 'Gestión de tipos de jornadas',
	},
	{
		key: 'room-types',
		icon: <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Tipos de Aula',
		description: 'Gestión de tipos de aula',
	},
	{
		key: 'connectivities',
		icon: <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Conectividades',
		description: 'Gestión de tipos de conectividad',
	},
	{
		key: 'conditions',
		icon: <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Condiciones',
		description: 'Gestión de condiciones de estado',
	},
	{
		key: 'brands',
		icon: <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Marcas',
		description: 'Gestión de marcas de equipo',
	},
	{
		key: 'pc-types',
		icon: <Computer className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Tipos de PC',
		description: 'Gestión de tipos de computadoras',
	},
	{
		key: 'audio-equipments',
		icon: <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Tipos de Audio',
		description: 'Gestión de tipos de audio',
	},
	{
		key: 'monitor-types',
		icon: <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Tipos de Monitor',
		description: 'Gestión de tipos de monitor',
	},
	{
		key: 'monitor-sizes',
		icon: <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Tamaños de Monitor',
		description: 'Gestión de tamaños de monitor',
	},
];

export const Catalog = () => {
	const [activeEntity, setActiveEntity] = useState<string | null>(null);

	const { data: teacherCategories, isLoading: tcLoading } =	useGetAllTeacherCategories();
	const { data: contractTypes, isLoading: ctLoading } = useGetAllContractTypes();
	const { data: brands, isLoading: brLoading } = useGetAllBrands();
	const { data: conditions, isLoading: cdLoading } = useGetAllConditions();
	const { data: roomTypes, isLoading: rtLoading } = useGetAllRoomTypes();
	const { data: connectivities, isLoading: cnLoading } = useGetAllConnectivities();
	const { data: pcTypes, isLoading: ptLoading } = useGetAllPcTypes();
	const { data: monitorTypes, isLoading: mtLoading } = useGetAllMonitorTypes();
	const { data: monitorSizes, isLoading: msLoading } = useGetAllMonitorSizes();
	const { data: shifts, isLoading: shLoading } = useGetAllShifts();
	const { data: audioEquipments, isLoading: aeLoading } =	useGetAllAudioEquipments();

	const entityConfig: Partial<Record<string, EntityConfig>> = useMemo(
		() => ({
			'teacher-categories': {
				fieldKey: 'name',
				data: teacherCategories,
				isLoading: tcLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					const results = await Promise.allSettled([
						...createItems.map(item =>
							teacherCategoriesApi.createTeacherCategory({
								name: item.value,
							})
						),
						...updateItems.map(item =>
							teacherCategoriesApi.updateTeacherCategory({
								id: item.id,
								body: { name: item.value },
							})
						),
						...deleteIds.map(id =>
							teacherCategoriesApi.deleteTeacherCategory(id)
						),
					]);
				queryClient.invalidateQueries({
					queryKey: teacherCategoriesKeys.all,
				});
				const fulfilled = results.slice(0, createItems.length).filter(r => r.status === 'fulfilled');
				const createdIds = fulfilled
					.map(r => (r.value as { data: { data: { id: string } } }).data.data.id)
					.filter((id): id is string => typeof id === 'string');
				const rejected = results.filter(r => r.status === 'rejected');
				if (rejected.length > 0) {
					throw rejected[0].reason;
				}
				return { createdIds };
			},
			},
			'contract-types': {
				fieldKey: 'name',
				data: contractTypes,
				isLoading: ctLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					const results = await Promise.allSettled([
						...createItems.map(item =>
							contractTypesApi.createContractType({
								name: item.value,
							})
						),
						...updateItems.map(item =>
							contractTypesApi.updateContractType({
								id: item.id,
								body: { name: item.value },
							})
						),
						...deleteIds.map(id =>
							contractTypesApi.deleteContractType(id)
						),
					]);
				queryClient.invalidateQueries({
					queryKey: contractTypesKeys.all,
				});
				const fulfilled = results.slice(0, createItems.length).filter(r => r.status === 'fulfilled');
				const createdIds = fulfilled
					.map(r => (r.value as { data: { data: { id: string } } }).data.data.id)
					.filter((id): id is string => typeof id === 'string');
				const rejected = results.filter(r => r.status === 'rejected');
				if (rejected.length > 0) {
					throw rejected[0].reason;
				}
				return { createdIds };
			},
			},
			'brands': {
				fieldKey: 'name',
				data: brands,
				isLoading: brLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					const results = await Promise.allSettled([
						...createItems.map(item =>
							brandsApi.createBrand({
								name: item.value,
							})
						),
						...updateItems.map(item =>
							brandsApi.updateBrand({
								id: item.id,
								body: { name: item.value },
							})
						),
						...deleteIds.map(id => brandsApi.deleteBrand(id)),
					]);
				queryClient.invalidateQueries({
					queryKey: brandsKeys.all,
				});
				const fulfilled = results.slice(0, createItems.length).filter(r => r.status === 'fulfilled');
				const createdIds = fulfilled
					.map(r => (r.value as { data: { data: { id: string } } }).data.data.id)
					.filter((id): id is string => typeof id === 'string');
				const rejected = results.filter(r => r.status === 'rejected');
				if (rejected.length > 0) {
					throw rejected[0].reason;
				}
				return { createdIds };
			},
			},
			'conditions': {
				fieldKey: 'status',
				data: conditions,
				isLoading: cdLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					const results = await Promise.allSettled([
						...createItems.map(item =>
							conditionsApi.createCondition({
								status: item.value,
							})
						),
						...updateItems.map(item =>
							conditionsApi.updateCondition({
								id: item.id,
								body: { status: item.value },
							})
						),
						...deleteIds.map(id =>
							conditionsApi.deleteCondition(id)
						),
					]);
				queryClient.invalidateQueries({
					queryKey: conditionsKeys.all,
				});
				const fulfilled = results.slice(0, createItems.length).filter(r => r.status === 'fulfilled');
				const createdIds = fulfilled
					.map(r => (r.value as { data: { data: { id: string } } }).data.data.id)
					.filter((id): id is string => typeof id === 'string');
				const rejected = results.filter(r => r.status === 'rejected');
				if (rejected.length > 0) {
					throw rejected[0].reason;
				}
				return { createdIds };
			},
			},
			'room-types': {
				fieldKey: 'description',
				data: roomTypes,
				isLoading: rtLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					const results = await Promise.allSettled([
						...createItems.map(item =>
							roomTypesApi.createRoomType({
								description: item.value,
							})
						),
						...updateItems.map(item =>
							roomTypesApi.updateRoomType({
								id: item.id,
								body: { description: item.value },
							})
						),
						...deleteIds.map(id => roomTypesApi.deleteRoomType(id)),
					]);
				queryClient.invalidateQueries({
					queryKey: roomTypesKeys.all,
				});
				const fulfilled = results.slice(0, createItems.length).filter(r => r.status === 'fulfilled');
				const createdIds = fulfilled
					.map(r => (r.value as { data: { data: { id: string } } }).data.data.id)
					.filter((id): id is string => typeof id === 'string');
				const rejected = results.filter(r => r.status === 'rejected');
				if (rejected.length > 0) {
					throw rejected[0].reason;
				}
				return { createdIds };
			},
			},
			'connectivities': {
				fieldKey: 'description',
				data: connectivities,
				isLoading: cnLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					const results = await Promise.allSettled([
						...createItems.map(item =>
							connectivitiesApi.createConnectivity({
								description: item.value,
							})
						),
						...updateItems.map(item =>
							connectivitiesApi.updateConnectivity({
								id: item.id,
								body: { description: item.value },
							})
						),
						...deleteIds.map(id =>
							connectivitiesApi.deleteConnectivity(id)
						),
					]);
				queryClient.invalidateQueries({
					queryKey: connectivitiesKeys.all,
				});
				const fulfilled = results.slice(0, createItems.length).filter(r => r.status === 'fulfilled');
				const createdIds = fulfilled
					.map(r => (r.value as { data: { data: { id: string } } }).data.data.id)
					.filter((id): id is string => typeof id === 'string');
				const rejected = results.filter(r => r.status === 'rejected');
				if (rejected.length > 0) {
					throw rejected[0].reason;
				}
				return { createdIds };
			},
			},
			'pc-types': {
				fieldKey: 'description',
				data: pcTypes,
				isLoading: ptLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					const results = await Promise.allSettled([
						...createItems.map(item =>
							pcTypesApi.createPcType({
								description: item.value,
							})
						),
						...updateItems.map(item =>
							pcTypesApi.updatePcType({
								id: item.id,
								body: { description: item.value },
							})
						),
						...deleteIds.map(id =>
							pcTypesApi.deletePcType(id)
						),
					]);
				queryClient.invalidateQueries({
					queryKey: pcTypesKeys.all,
				});
				const fulfilled = results.slice(0, createItems.length).filter(r => r.status === 'fulfilled');
				const createdIds = fulfilled
					.map(r => (r.value as { data: { data: { id: string } } }).data.data.id)
					.filter((id): id is string => typeof id === 'string');
				const rejected = results.filter(r => r.status === 'rejected');
				if (rejected.length > 0) {
					throw rejected[0].reason;
				}
				return { createdIds };
			},
			},
			'monitor-types': {
				fieldKey: 'description',
				data: monitorTypes,
				isLoading: mtLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					const results = await Promise.allSettled([
						...createItems.map(item =>
							monitorTypesApi.createMonitorType({
								description: item.value,
							})
						),
						...updateItems.map(item =>
							monitorTypesApi.updateMonitorType({
								id: item.id,
								body: { description: item.value },
							})
						),
						...deleteIds.map(id =>
							monitorTypesApi.deleteMonitorType(id)
						),
					]);
				queryClient.invalidateQueries({
					queryKey: monitorTypesKeys.all,
				});
				const fulfilled = results.slice(0, createItems.length).filter(r => r.status === 'fulfilled');
				const createdIds = fulfilled
					.map(r => (r.value as { data: { data: { id: string } } }).data.data.id)
					.filter((id): id is string => typeof id === 'string');
				const rejected = results.filter(r => r.status === 'rejected');
				if (rejected.length > 0) {
					throw rejected[0].reason;
				}
				return { createdIds };
			},
			},
			'monitor-sizes': {
				fieldKey: 'description',
				data: monitorSizes,
				isLoading: msLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					const results = await Promise.allSettled([
						...createItems.map(item =>
							monitorSizesApi.createMonitorSize({
								description: item.value,
							})
						),
						...updateItems.map(item =>
							monitorSizesApi.updateMonitorSize({
								id: item.id,
								body: { description: item.value },
							})
						),
						...deleteIds.map(id =>
							monitorSizesApi.deleteMonitorSize(id)
						),
					]);
				queryClient.invalidateQueries({
					queryKey: monitorSizesKeys.all,
				});
				const fulfilled = results.slice(0, createItems.length).filter(r => r.status === 'fulfilled');
				const createdIds = fulfilled
					.map(r => (r.value as { data: { data: { id: string } } }).data.data.id)
					.filter((id): id is string => typeof id === 'string');
				const rejected = results.filter(r => r.status === 'rejected');
				if (rejected.length > 0) {
					throw rejected[0].reason;
				}
				return { createdIds };
			},
			},
			'shifts': {
				fieldKey: 'name',
				data: shifts,
				isLoading: shLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					const results = await Promise.allSettled([
						...createItems.map(item =>
							shiftsApi.createShift({
								name: item.value,
							})
						),
						...updateItems.map(item =>
							shiftsApi.updateShift({
								id: item.id,
								body: { name: item.value },
							})
						),
						...deleteIds.map(id =>
							shiftsApi.deleteShift(id)
						),
					]);
				queryClient.invalidateQueries({
					queryKey: shiftsKeys.all,
				});
				const fulfilled = results.slice(0, createItems.length).filter(r => r.status === 'fulfilled');
				const createdIds = fulfilled
					.map(r => (r.value as { data: { data: { id: string } } }).data.data.id)
					.filter((id): id is string => typeof id === 'string');
				const rejected = results.filter(r => r.status === 'rejected');
				if (rejected.length > 0) {
					throw rejected[0].reason;
				}
				return { createdIds };
			},
			},
			'audio-equipments': {
				fieldKey: 'description',
				data: audioEquipments,
				isLoading: aeLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					const results = await Promise.allSettled([
						...createItems.map(item =>
							audioEquipmentsApi.createAudioEquipment({
								description: item.value,
							})
						),
						...updateItems.map(item =>
							audioEquipmentsApi.updateAudioEquipment(
								item.id,
								{ description: item.value }
							)
						),
						...deleteIds.map(id =>
							audioEquipmentsApi.deleteAudioEquipment(id)
						),
					]);
				queryClient.invalidateQueries({
					queryKey: audioEquipmentsKeys.all,
				});
				const fulfilled = results.slice(0, createItems.length).filter(r => r.status === 'fulfilled');
				const createdIds = fulfilled
					.map(r => (r.value as { data: { data: { id: string } } }).data.data.id)
					.filter((id): id is string => typeof id === 'string');
				const rejected = results.filter(r => r.status === 'rejected');
				if (rejected.length > 0) {
					throw rejected[0].reason;
				}
				return { createdIds };
			},
			},
		}),
		[
			teacherCategories,
			tcLoading,
			contractTypes,
			ctLoading,
			brands,
			brLoading,
			conditions,
			cdLoading,
			roomTypes,
			rtLoading,
			connectivities,
			cnLoading,
			pcTypes,
			ptLoading,
			monitorTypes,
			mtLoading,
			monitorSizes,
			msLoading,
			shifts,
			shLoading,
			audioEquipments,
			aeLoading,
		]
	);

	const activeConfig = activeEntity ? entityConfig[activeEntity] : null;

	const activeItem = activeEntity
		? configItems.find(item => item.key === activeEntity)
		: null;

	return (
		<div className="w-auto mx-auto mt-4 sm:mt-6 md:mt-8 mb-8 md:mb-12 px-3 sm:px-4">
			<div className="animate-in slide-up">
				<div className="bg-card border border-card-border rounded-xl md:rounded-2xl shadow-lg shadow-primary/5 overflow-hidden">
					{/* Header */}
					<div className="bg-linear-to-r from-primary to-primary-hover px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
						<div className="flex items-center gap-3 sm:gap-4">
							<div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-xl md:rounded-2xl flex items-center justify-center">
								<Square2StackIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
							</div>
							<div>
								<h2 className="text-white font-display text-base sm:text-lg md:text-xl">
									Catálogo
								</h2>
								<p className="text-white/70 text-xs sm:text-sm">
									Gestión de valores auxiliares del sistema
								</p>
							</div>
						</div>
					</div>

					{/* Cards */}
					<div className="p-4 sm:p-6 md:p-8">
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
							{configItems.map(item => (
								<CatalogCard
									key={item.key}
									icon={item.icon}
									title={item.title}
									description={item.description}
									onClick={
										entitySubjects.has(item.key)
											? () => setActiveEntity(item.key)
											: undefined
									}
								/>
							))}
						</div>
					</div>
				</div>
			</div>

			{activeConfig && activeItem && (
				<CatalogCrudModal
					isOpen={true}
					onClose={() => setActiveEntity(null)}
					title={activeItem.title}
					description={activeItem.description}
					subject={activeEntity as Subjects}
					fieldKey={activeConfig.fieldKey}
					initialData={activeConfig.data}
					isLoading={activeConfig.isLoading}
					onSave={activeConfig.onSave}
				/>
			)}
		</div>
	);
};
