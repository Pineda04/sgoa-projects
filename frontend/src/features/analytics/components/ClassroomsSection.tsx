import { useSearchParams } from 'react-router-dom';
import { ClassroomAvailabilitySection } from './ClassroomAvailabilitySection';
import { ClassroomCapacitySection } from './ClassroomCapacitySection';

export const ClassroomsSection = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const view = searchParams.get('classroomView') === 'capacity' ? 'capacity' : 'availability';
	const selectView = (nextView: 'availability' | 'capacity') => {
		setSearchParams(current => {
			const next = new URLSearchParams(current);
			next.set('classroomView', nextView);
			return next;
		});
	};
	return <div>
		<div className="mb-6 flex w-fit rounded-xl border border-border bg-muted p-1" role="tablist" aria-label="Vista de aulas">
			<button type="button" role="tab" aria-selected={view === 'availability'} onClick={() => selectView('availability')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${view === 'availability' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Disponibilidad</button>
			<button type="button" role="tab" aria-selected={view === 'capacity'} onClick={() => selectView('capacity')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${view === 'capacity' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Capacidad</button>
		</div>
		{view === 'availability' ? <ClassroomAvailabilitySection /> : <ClassroomCapacitySection />}
	</div>;
};
