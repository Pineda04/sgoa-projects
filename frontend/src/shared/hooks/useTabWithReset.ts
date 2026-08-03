import { useSearchParams } from 'react-router-dom';

export const useTabWithReset = (
	validTabs: string[],
	defaultTab: string = '0'
) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const tabParam = searchParams.get('tab');
	const currentTab = validTabs.includes(String(tabParam))
		? String(tabParam)
		: defaultTab;

	const setTab = (value: string) => {
		setSearchParams(
			prev => {
				prev.set('tab', value);
				prev.set('page', '1');
				return prev;
			},
			{ replace: true }
		);
	};

	return { currentTab, setTab };
};