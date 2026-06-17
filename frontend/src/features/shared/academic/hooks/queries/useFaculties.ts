import { useQuery } from "@tanstack/react-query";
import { facultiesApi } from "../../api";
import { STALE_TIME } from "@lib/tanstack";
import { facultyKeys } from "@features/centers/faculties";

export const useGetAllFaculties = () =>
    useQuery({
        queryKey: facultyKeys.all,
        queryFn: facultiesApi.getAllFaculties,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: STALE_TIME.VERY_LONG,
        select: res => res.data.data,
    })