import { Navigate } from 'react-router-dom';
import { Button } from '@shared/components';
import {
	useAnalyticsFilterOptions,
	type AnalyticsDomain,
} from '@api/analytics';
import {
	AcademicLoadSection,
	ActivitiesSection,
	AnalyticsFilters,
	AnalyticsLayout,
	AnalyticsPageSkeleton,
	ClassroomsSection,
	EnrollmentSection,
	StaffSection,
	TechnologySection,
	MonitoringSection,
} from '../components';
import {
	useAnalyticsSearchParams,
	type ImplementedAnalyticsDomain,
} from '../hooks';

const isImplemented = (
	domain: AnalyticsDomain
): domain is ImplementedAnalyticsDomain => Boolean(domain);

export const AnalyticsPage = () => {
	const [query] = useAnalyticsSearchParams();
	const filterOptions = useAnalyticsFilterOptions();
	const domains = filterOptions.data?.domains.filter(isImplemented) ?? [];
	const requestedSection = query.section;
	const activeDomain =
		domains.find(domain => domain === requestedSection) ?? domains[0];
	if (
		activeDomain &&
		filterOptions.isSuccess &&
		requestedSection !== activeDomain
	) {
		return <Navigate replace to={{ search: `?section=${activeDomain}` }} />;
	}
	return (
		<AnalyticsLayout.Root>
			<AnalyticsLayout.Header />
			{filterOptions.isPending ? (
				<AnalyticsPageSkeleton />
			) : filterOptions.isError ? (
				<AnalyticsLayout.Message title="No se pudo cargar Analytics">
					<span className="block">
						Ocurrió un error al consultar tus permisos y opciones
						autorizadas.
					</span>
					<Button
						className="mt-4"
						size="sm"
						onClick={() => filterOptions.refetch()}
					>
						Reintentar
					</Button>
				</AnalyticsLayout.Message>
			) : !activeDomain ? (
				<AnalyticsLayout.Message title="Sin dominios de Analytics">
					Tu usuario no tiene un dominio de datos implementado y
					autorizado.
				</AnalyticsLayout.Message>
			) : (
				<>
					<AnalyticsLayout.Section>
						<AnalyticsFilters domain={activeDomain} />
					</AnalyticsLayout.Section>
					<AnalyticsLayout.Section>
						{activeDomain === 'academic-load' ? (
							<AcademicLoadSection />
						) : activeDomain === 'enrollment' ? (
							<EnrollmentSection />
						) : activeDomain === 'classrooms' ? (
							<ClassroomsSection />
						) : activeDomain === 'technology' ? (
							<TechnologySection />
						) : activeDomain === 'staff' ? (
							<StaffSection />
						) : activeDomain === 'activities' ? (
							<ActivitiesSection />
						) : (
							<MonitoringSection />
						)}
					</AnalyticsLayout.Section>
				</>
			)}
		</AnalyticsLayout.Root>
	);
};
