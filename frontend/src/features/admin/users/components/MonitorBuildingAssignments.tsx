import { useState } from 'react';
import { useGetAllBuildings } from '@api/buildings';
import {
	useMonitorBuildingAssignments,
	useReplaceMonitorBuildingAssignments,
	useUsers,
} from '@api/users';
import { Button, Skeleton } from '@shared/components';

interface AssignmentEditorProps {
	userId: string;
	assignedBuildingIds: string[];
	buildings: { id: string; name: string; center?: { name: string } }[];
}

const AssignmentEditor = ({
	userId,
	assignedBuildingIds,
	buildings,
}: AssignmentEditorProps) => {
	const [selectedIds, setSelectedIds] = useState(assignedBuildingIds);
	const mutation = useReplaceMonitorBuildingAssignments();
	const toggle = (buildingId: string) => {
		setSelectedIds(current =>
			current.includes(buildingId)
				? current.filter(id => id !== buildingId)
				: [...current, buildingId]
		);
	};

	return (
		<div className="mt-5">
			<div className="grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
				{buildings.map(building => (
					<label
						key={building.id}
						className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3"
					>
						<input
							type="checkbox"
							checked={selectedIds.includes(building.id)}
							onChange={() => toggle(building.id)}
							className="mt-1 size-4"
						/>
						<span>
							<span className="block text-sm font-semibold">{building.name}</span>
							<span className="text-xs text-muted-foreground">
								{building.center?.name ?? 'Centro sin información'}
							</span>
						</span>
					</label>
				))}
			</div>
			<div className="mt-4 flex justify-end">
				<Button
					type="button"
					disabled={mutation.isPending}
					onClick={() =>
						mutation.mutate({ userId, buildingIds: selectedIds })
					}
				>
					{mutation.isPending ? 'Guardando...' : 'Guardar asignaciones'}
				</Button>
			</div>
		</div>
	);
};

export const MonitorBuildingAssignments = () => {
	const [monitorId, setMonitorId] = useState('');
	const users = useUsers();
	const buildings = useGetAllBuildings();
	const assignments = useMonitorBuildingAssignments(monitorId);
	const monitors = (users.data ?? []).filter(user =>
		user.userRoles.some(({ role }) => role.name === 'MONITOR')
	);

	return (
		<section className="rounded-xl border border-card-border bg-card p-4 shadow-card">
			<h2 className="text-lg font-semibold text-card-foreground">
				Edificios por monitor
			</h2>
			<p className="mt-1 text-sm text-muted-foreground">
				La lista reemplaza el alcance operativo y analítico futuro del monitor.
			</p>
			<label className="mt-4 block max-w-xl text-sm font-semibold">
				Monitor
				<select
					value={monitorId}
					onChange={event => setMonitorId(event.target.value)}
					className="mt-2 min-h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
				>
					<option value="">Selecciona un monitor</option>
					{monitors.map(monitor => (
						<option key={monitor.id} value={monitor.id}>
							{monitor.code} - {monitor.name}
						</option>
					))}
				</select>
			</label>
			{monitorId && (assignments.isPending || buildings.isPending) ? (
				<Skeleton className="mt-5 h-48 rounded-xl" />
			) : monitorId && assignments.data && buildings.data ? (
				<AssignmentEditor
					key={`${monitorId}:${assignments.data.buildings.map(building => building.id).join(',')}`}
					userId={monitorId}
					assignedBuildingIds={assignments.data.buildings.map(
						building => building.id
					)}
					buildings={buildings.data}
				/>
			) : null}
		</section>
	);
};
