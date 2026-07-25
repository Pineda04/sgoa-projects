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
	User,
} from 'lucide-react';
import { Settings2 } from 'lucide-react';
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
import { queryClient } from '@config/lib';
import { type Subjects } from '@config/lib';
import { genericAlert } from '@shared/utils';
import { CatalogCard, CatalogCrudModal } from '../components';

type EntityConfig = {
	fieldKey: string;
	data: Array<{ id: string; [key: string]: string }> | undefined;
	isLoading: boolean;
	onSave: (
		createItems: Array<{ value: string }>,
		updateItems: Array<{ id: string; value: string }>,
		deleteIds: string[]
	) => Promise<void>;
};

const entitySubjects = new Set<string>([
	'contract-types',
	'brands',
	'conditions',
	'room-types',
]);

const configItems = [
	{
		key: 'teacher-categories',
		icon: <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
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
		key: 'brands',
		icon: <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Marcas',
		description: 'Gestión de marcas de equipo',
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
		key: 'pc-types',
		icon: <Computer className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />,
		title: 'Tipos de PC',
		description: 'Gestión de tipos de computadoras',
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

	const { data: contractTypes, isLoading: ctLoading } = useGetAllContractTypes();
	const { data: brands, isLoading: brLoading } = useGetAllBrands();
	const { data: conditions, isLoading: cdLoading } = useGetAllConditions();
  const { data: roomTypes, isLoading: rtLoading } = useGetAllRoomTypes();

	const entityConfig: Partial<Record<string, EntityConfig>> = useMemo(
		() => ({
			'contract-types': {
				fieldKey: 'name',
				data: contractTypes,
				isLoading: ctLoading,
				onSave: async (
					createItems: Array<{ value: string }>,
					updateItems: Array<{ id: string; value: string }>,
					deleteIds: string[]
				) => {
					await Promise.all([
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
					queryClient.removeQueries({
						queryKey: contractTypesKeys.all,
					});
					await genericAlert('Cambios guardados correctamente');
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
					await Promise.all([
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
						...deleteIds.map(id =>
							brandsApi.deleteBrand(id)
						),
					]);
					queryClient.removeQueries({
						queryKey: brandsKeys.all,
					});
					await genericAlert('Cambios guardados correctamente');
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
					await Promise.all([
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
					queryClient.removeQueries({
						queryKey: conditionsKeys.all,
					});
					await genericAlert('Cambios guardados correctamente');
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
					await Promise.all([
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
					queryClient.removeQueries({
						queryKey: roomTypesKeys.all,
					});
					await genericAlert('Cambios guardados correctamente');
				},
			},
		}),
		[
			contractTypes,
			ctLoading,
			brands,
			brLoading,
			conditions,
			cdLoading,
			roomTypes,
			rtLoading,
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
								<Settings2 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
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
