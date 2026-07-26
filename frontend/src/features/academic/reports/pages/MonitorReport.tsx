import { MonitorReports } from '@features/dashboard/components/monitor-reports';

export const MonitorReport = () => {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-foreground">
					Reporte de Cumplimiento — Monitoreo
				</h1>
				<p className="text-sm text-muted-foreground">
					Consulta detallada de las verificaciones de cumplimiento de horario
					registradas por los monitores.
				</p>
			</div>

			<MonitorReports />
		</div>
	);
};
