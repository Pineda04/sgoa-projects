import { useQuery } from "@tanstack/react-query";
import { facultiesApi } from "../../api";
import { STALE_TIME } from "@config/lib";
import { facultiesKeys } from "@api/faculties";

export const useGetAllFaculties = () =>
    useQuery({
        queryKey: facultiesKeys.all,
        queryFn: facultiesApi.getAllFaculties,
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: STALE_TIME.VERY_LONG,
        select: res => res.data.data,
    })

export const useGetOneFaculty = (id: string) =>
    useQuery({
        queryKey: facultiesKeys.detail(id),
        queryFn: () => facultiesApi.getOneFaculty(id),
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: STALE_TIME.VERY_LONG,
        enabled: !!id,
        select: res => res.data.data,
    })