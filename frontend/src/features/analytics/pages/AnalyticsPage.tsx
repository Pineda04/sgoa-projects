import { Navigate, useSearchParams } from 'react-router-dom';
import { Button, Skeleton } from '@shared/components';
import { useAnalyticsFilterOptions, type AnalyticsDomain } from '@api/analytics';
import {
	AcademicLoadSection,
	ActivitiesSection,
	AnalyticsFilters,
	AnalyticsLayout,
	ClassroomsSection,
	EnrollmentSection,
	StaffSection,
	TechnologySection,
	MonitoringSection,
} from '../components';
import { useAnalyticsFilters, type ImplementedAnalyticsDomain } from '../hooks';

const DOMAIN_LABELS = {
	'academic-load': 'Carga académica',
	enrollment: 'Matrícula',
	classrooms: 'Aulas',
	technology: 'Tecnología',
	staff: 'Personal',
	activities: 'Actividades',
	monitoring: 'Monitoreo',
} satisfies Record<ImplementedAnalyticsDomain, string>;

const isImplemented = (domain: AnalyticsDomain): domain is ImplementedAnalyticsDomain => Boolean(domain);

export const AnalyticsPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const filterOptions = useAnalyticsFilterOptions();
	const domains = filterOptions.data?.domains.filter(isImplemented) ?? [];
	const requestedSection = searchParams.get('section');
	const activeDomain = domains.find(domain => domain === requestedSection) ?? domains[0];
	const canonical = useAnalyticsFilters(activeDomain ?? 'academic-load');
	const selectDomain = (domain: ImplementedAnalyticsDomain) => {
		setSearchParams({ section: domain });
	};
	if (
		activeDomain &&
		canonical.isCanonicalReady &&
		canonical.canonicalSearchParams.toString() !== searchParams.toString()
	) {
		return (
			<Navigate
				replace
				to={{ search: `?${canonical.canonicalSearchParams.toString()}` }}
			/>
		);
	}
	return <AnalyticsLayout.Root>
		<AnalyticsLayout.Header>{filterOptions.data?.capabilities.canExport ? <span className="w-fit rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary">Exportación disponible</span> : null}</AnalyticsLayout.Header>
		{filterOptions.isPending ? <div className="space-y-5"><Skeleton className="h-16 rounded-2xl" /><Skeleton className="h-36 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div> : filterOptions.isError ? <AnalyticsLayout.Message title="No se pudo cargar Analytics"><span className="block">Ocurrió un error al consultar tus permisos y opciones autorizadas.</span><Button className="mt-4" size="sm" onClick={() => filterOptions.refetch()}>Reintentar</Button></AnalyticsLayout.Message> : !activeDomain ? <AnalyticsLayout.Message title="Sin dominios de Analytics">Tu usuario no tiene un dominio de datos implementado y autorizado.</AnalyticsLayout.Message> : <>
			<nav className="mb-6 overflow-x-auto rounded-2xl border border-card-border bg-card p-2 shadow-card" aria-label="Dominios de analíticas"><div className="flex min-w-max gap-1">{domains.map(domain => <button key={domain} type="button" onClick={() => selectDomain(domain)} aria-current={activeDomain === domain ? 'page' : undefined} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${activeDomain === domain ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{DOMAIN_LABELS[domain]}</button>)}</div></nav>
			<AnalyticsLayout.Section><AnalyticsFilters domain={activeDomain} /></AnalyticsLayout.Section>
			<AnalyticsLayout.Section>
				{activeDomain === 'academic-load' ? <AcademicLoadSection /> : activeDomain === 'enrollment' ? <EnrollmentSection /> : activeDomain === 'classrooms' ? <ClassroomsSection /> : activeDomain === 'technology' ? <TechnologySection /> : activeDomain === 'staff' ? <StaffSection /> : activeDomain === 'activities' ? <ActivitiesSection /> : <MonitoringSection />}
			</AnalyticsLayout.Section>
		</>}
	</AnalyticsLayout.Root>;
};
