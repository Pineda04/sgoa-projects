export interface IResponse<T> {
	status: boolean;
	statusCode: number;
	path: string;
	message: string;
	data: T;
	meta?: {
		total?: number;
		lastPage?: number;
		currentPage?: number;
		totalPerPage?: number;
		prevPage?: number | null;
		nextPage?: number | null;
	};
	timestamp: string;
}

// Request
export interface IErrorResponse {
	message: string;
	data: object | Array<string | object> | string;
}
