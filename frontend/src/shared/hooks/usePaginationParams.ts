import { useSearchParams } from 'react-router-dom';

const DEFAULT_SIZE = 10;
const DEFAULT_PAGE = 1;

export const usePaginationParams = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const pageParam = searchParams.get('page');
	const sizeParam = searchParams.get('size');

	const page =
		pageParam && !isNaN(+pageParam)
			? parseInt(pageParam, 10)
			: DEFAULT_PAGE;
	const size =
		sizeParam && !isNaN(+sizeParam)
			? parseInt(sizeParam, 10)
			: DEFAULT_SIZE;

	const setPage = (newPage: number) => {
		setSearchParams(prev => {
			prev.set('page', String(newPage));
			return prev;
		});
	};

	const setSize = (newSize: number) => {
		setSearchParams(prev => {
			prev.set('size', String(newSize));
			return prev;
		});
	};

	return { page, size, setPage, setSize };
};
