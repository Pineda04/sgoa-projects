import { useQuery } from "@tanstack/react-query";
import { contractTypesKeys } from "./contract-types.keys";
import { contractTypesApi } from "./contract-types.api";
import { STALE_TIME } from '@config/lib';

export const useGetAllContractTypes = () =>
	useQuery({
		queryKey: contractTypesKeys.all,
		queryFn: contractTypesApi.getAllContractTypes,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: STALE_TIME.VERY_LONG,
		select: res => res.data.data,
  });
