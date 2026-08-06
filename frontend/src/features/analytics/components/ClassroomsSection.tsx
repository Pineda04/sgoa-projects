import { Tabs, TabsList, TabsTrigger } from '@shared/components';
import { useAnalyticsFilters } from '../hooks';
import { ClassroomAvailabilitySection } from './ClassroomAvailabilitySection';
import { ClassroomCapacitySection } from './ClassroomCapacitySection';

export const ClassroomsSection = () => {
	const { setClassroomView, values } = useAnalyticsFilters('classrooms');
	const view = values.classroomView;
	const selectView = (nextView: 'availability' | 'capacity') => {
		setClassroomView(nextView);
	};
	return <div>
		<Tabs value={view} onValueChange={value => {
			if (value === 'availability' || value === 'capacity') selectView(value);
		}} className="mb-6">
			<TabsList variant="pills" aria-label="Vista de aulas">
				<TabsTrigger value="availability">Disponibilidad</TabsTrigger>
				<TabsTrigger value="capacity">Capacidad</TabsTrigger>
			</TabsList>
		</Tabs>
		{view === 'availability' ? <ClassroomAvailabilitySection /> : <ClassroomCapacitySection />}
	</div>;
};
