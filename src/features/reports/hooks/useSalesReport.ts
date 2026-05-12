import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { reportsApi, reportsKeys } from '@/lib/api/reports'
import type { SalesReportFilters } from '@/lib/types/report'

export function useSalesReportQuery(filters: SalesReportFilters) {
  return useQuery({
    queryKey: reportsKeys.salesReport(filters),
    queryFn: () => reportsApi.salesReport(filters),
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  })
}
