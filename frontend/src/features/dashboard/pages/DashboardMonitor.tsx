import {
	useTabWithReset,
	useSyncEngine,
	useIsOnline,
	useCachedAcademicPeriod,
} from '@shared/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components';
import { useAuth, useUser } from '@config/providers';
import { useGetCurrentAcademicPeriod } from '@api/periods';
import { MonitorChecklist, MonitorReports } from '../components';
import { ListClassrooms } from '@features/infrastructure';

export const DashboardMonitor = () => {
	const isOnline = useIsOnline();
	// Feature: sin conexión solo es válido el tab del checklist; las pestañas de
	// Reportes y Aulas requieren red. useTabWithReset descarta el tab fuera de
	// rango y devuelve a Checklist si se pierde la red estando en otra pestaña.
	const validTabs = isOnline ? ['0', '1', '2'] : ['0'];
	const { currentTab, setTab } = useTabWithReset(validTabs);
	const currentUser = useUser();
	// Feature: email de la sesión (JWT) como clave de la caché Dexie; está disponible
	// incluso offline, a diferencia de useUser() que hace una petición HTTP.
	const sessionEmail = useAuth().authState.user?.email;
	const academicPeriodInfo = useGetCurrentAcademicPeriod({
		enabled: isOnline,
		email: sessionEmail,
	});
	// Feature: leer el período vigente desde Dexie cuando no hay red. Fallback encadenado:
	// conserva el título ya cargado mientras la fuente nueva aún se está resolviendo.
	const cachedAcademicPeriod = useCachedAcademicPeriod(sessionEmail);
	const periodTitle =
		academicPeriodInfo.data?.title ?? cachedAcademicPeriod?.title;
	const { status, pendingCount, forceSync } = useSyncEngine(sessionEmail);

	return (
		<div className="pb-8 sm:pb-12">
			<div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-semibold mb-2">
						UNAH PAC {periodTitle ?? '...'}
					</h2>
					<p className="text-sm">{currentUser.user?.name}</p>
					<p className="text-sm">{currentUser.user?.code}</p>
					<p className="text-sm">{sessionEmail}</p>
				</div>
			</div>

			<Tabs
				value={currentTab}
				onValueChange={setTab}
				className="mt-4 sm:mt-8"
			>
				<TabsList variant="pills" className="mb-4 sm:mb-6">
					<TabsTrigger
						value="0"
						className="gap-1.5 sm:gap-2 text-xs sm:text-sm"
					>
						Checklist
					</TabsTrigger>
					<TabsTrigger
						value="1"
						disabled={!isOnline}
						className="gap-1.5 sm:gap-2 text-xs sm:text-sm"
					>
						Reportes
					</TabsTrigger>
					<TabsTrigger
						value="2"
						disabled={!isOnline}
						className="gap-1.5 sm:gap-2 text-xs sm:text-sm"
					>
						Aulas
					</TabsTrigger>
				</TabsList>

				<TabsContent value="0">
					<div className="bg-card border border-card-border rounded-xl shadow-lg shadow-primary/5 overflow-hidden p-4 sm:p-6">
						<MonitorChecklist
							syncStatus={status}
							syncPendingCount={pendingCount}
							onSyncRetry={forceSync}
						/>
					</div>
				</TabsContent>

				<TabsContent value="1">
					<div className="bg-card border border-card-border rounded-xl shadow-lg shadow-primary/5 overflow-hidden p-4 sm:p-6">
						<MonitorReports />
					</div>
				</TabsContent>

				<TabsContent value="2">
					<ListClassrooms showHeader={false} />
				</TabsContent>
			</Tabs>
		</div>
	);
};
