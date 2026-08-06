import type { RouteObject } from 'react-router-dom';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import { AnalyticsPage } from '../pages';

export const analyticsRoutes: RouteObject[] = [
	{
		index: true,
		element: (
			<NuqsAdapter>
				<AnalyticsPage />
			</NuqsAdapter>
		),
	},
];
