import type { ReactNode } from 'react';

const AnalyticsLayoutRoot = ({ children }: { children: ReactNode }) => (
	<main className="analytics-root mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
		{children}
	</main>
);

const AnalyticsLayoutHeader = () => (
	<header className="mb-5">
		<div>
			<h1 className="text-2xl font-bold text-foreground">Analíticas</h1>
			<p className="mt-1 max-w-2xl text-muted-foreground">
				Consulta indicadores autorizados académicos, de infraestructura,
				tecnología, personal y actividades.
			</p>
		</div>
	</header>
);

const AnalyticsLayoutSection = ({ children }: { children: ReactNode }) => (
	<section className="mb-6 rounded-2xl border border-card-border bg-card p-4 shadow-card sm:p-6">
		{children}
	</section>
);

const AnalyticsLayoutMessage = ({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) => (
	<div className="rounded-2xl border border-card-border bg-card px-6 py-12 text-center shadow-card">
		<h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
		<p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
			{children}
		</p>
	</div>
);

export const AnalyticsLayout = Object.assign(AnalyticsLayoutRoot, {
	Root: AnalyticsLayoutRoot,
	Header: AnalyticsLayoutHeader,
	Section: AnalyticsLayoutSection,
	Message: AnalyticsLayoutMessage,
});
