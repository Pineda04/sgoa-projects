import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_TAB = 'all';

export const useTabs = <T extends string>(
	validTabs: T[],
	defaultTab: T = DEFAULT_TAB as T
) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const activeTab = searchParams.get('tab') ?? defaultTab;

	const selectedTab = useMemo(() => {
		return validTabs.includes(activeTab as T)
			? (activeTab as T)
			: defaultTab;
	}, [activeTab, validTabs, defaultTab]);

	const setTab = (tab: T) => {
		setSearchParams(prev => {
			prev.set('tab', tab);
			prev.set('page', '1');
			return prev;
		});
	};

	return { tab: selectedTab, setTab };
};
