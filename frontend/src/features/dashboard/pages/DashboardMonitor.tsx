import { useTabWithReset } from '@shared/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/components';
import { useUser } from '@config/providers';
import { MonitorChecklist } from '../components';

export const DashboardMonitor = () => {
	const validTabs = ['0', '1'];
	const { currentTab, setTab } = useTabWithReset(validTabs);
	const currentUser = useUser();

	return (
		<div className="pb-8 sm:pb-12">
			<div className="mb-6">
				<h2 className="text-2xl font-semibold mb-2">
					Panel de Monitoreo
				</h2>
				<p className="text-sm">{currentUser.user?.name}</p>
				<p className="text-sm">{currentUser.user?.code}</p>
				<p className="text-sm">{currentUser.user?.email || ''}</p>
			</div>

			<Tabs
				value={currentTab}
				onValueChange={setTab}
				className="mt-4 sm:mt-8"
			>
				<TabsList variant="pills" className="mb-4 sm:mb-6">
					<TabsTrigger value="0" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
						Checklist
					</TabsTrigger>
					<TabsTrigger value="1" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
						Reportes
					</TabsTrigger>
				</TabsList>

				<TabsContent value="0">
					<div className="bg-card border border-card-border rounded-xl shadow-lg shadow-primary/5 overflow-hidden p-6">
						<MonitorChecklist />
					</div>
				</TabsContent>

				<TabsContent value="1">
					<div className="bg-card border border-card-border rounded-xl shadow-lg shadow-primary/5 overflow-hidden p-6">
						<p className="text-muted-foreground text-center py-12">
							Módulo de reportes — Próximamente
						</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
};
