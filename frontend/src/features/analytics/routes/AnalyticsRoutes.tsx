import type { RouteObject } from 'react-router-dom';
import { AnalyticsPage } from '../pages';

export const analyticsRoutes: RouteObject[] = [
	{ index: true, element: <AnalyticsPage /> },
];
