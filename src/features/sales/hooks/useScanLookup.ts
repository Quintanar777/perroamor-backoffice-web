import { useMutation } from '@tanstack/react-query'
import { catalogLookupApi } from '@/lib/api/catalog'

export function useScanLookup() {
  return useMutation({
    mutationFn: (code: string) => catalogLookupApi.byCode(code),
  })
}
