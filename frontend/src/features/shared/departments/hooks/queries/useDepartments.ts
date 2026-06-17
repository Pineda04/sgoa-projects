import { STALE_TIME } from "@lib/tanstack";
import { useQuery } from "@tanstack/react-query";
import { departmentKeys } from "../../constants";
import { departmentsApi } from "../../api";
//  import { usePaginationParams } from '@hooks'; //el endpoint getall no incluye paginacion

export const useGetDepartments = () => {
    return useQuery({
        queryKey: departmentKeys.all,
        queryFn: () => departmentsApi.getAllDepartments(),
        staleTime: STALE_TIME.VERY_LONG,
        select: res => res.data
    })
}