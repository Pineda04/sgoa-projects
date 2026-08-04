import type { ReactNode } from 'react';

const AnalyticsLayoutRoot = ({ children }: { children: ReactNode }) => (
	<main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
		{children}
	</main>
);

const AnalyticsLayoutHeader = ({ children }: { children?: ReactNode }) => (
	<header className="mb-6 overflow-hidden rounded-2xl border border-card-border bg-card shadow-card">
		<div className="border-l-4 border-accent px-5 py-5 sm:px-7">
			<p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
				Control académico
			</p>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-card-foreground sm:text-3xl">
						Analíticas
					</h1>
					<p className="mt-2 max-w-2xl text-sm text-muted-foreground">
						Consulta indicadores autorizados académicos, de infraestructura,
						tecnología, personal y actividades.
					</p>
				</div>
				{children}
			</div>
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
