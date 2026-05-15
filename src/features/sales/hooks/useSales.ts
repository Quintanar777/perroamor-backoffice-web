import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { salesApi, salesKeys } from '@/lib/api/sales'
import { ApiError, NetworkError } from '@/lib/types/api'
import type { Sale, SaleFilters, SaleStatsFilters } from '@/lib/types/sale'

export function useSalesQuery(filters: SaleFilters) {
  return useQuery({
    queryKey: salesKeys.list(filters),
    queryFn: () => salesApi.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useSaleQuery(id: number) {
  return useQuery({
    queryKey: salesKeys.detail(id),
    queryFn: () => salesApi.get(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

export function useSaleStatsQuery(filters: SaleStatsFilters | null | undefined) {
  return useQuery({
    queryKey: filters ? salesKeys.stats(filters) : ['sales', 'stats', 'noop'],
    queryFn: () => salesApi.stats(filters!),
    enabled: !!filters && typeof filters.eventId === 'number' && filters.eventId > 0,
    staleTime: 30_000,
  })
}

export function useCancelSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sale: Sale) => salesApi.cancel(sale.id),
    onSuccess: (sale) => {
      qc.invalidateQueries({ queryKey: ['sales'] })
      qc.invalidateQueries({ queryKey: ['catalog', 'products'] })
      qc.invalidateQueries({ queryKey: ['catalog', 'combos'] })
      qc.invalidateQueries({ queryKey: ['catalog', 'all-products'] })
      qc.invalidateQueries({ queryKey: ['catalog', 'all-combos'] })
      qc.setQueryData(salesKeys.detail(sale.id), sale)
      toast.success('Venta cancelada', {
        description: 'El stock de los componentes fue restituido.',
      })
    },
    onError: (error) => {
      if (error instanceof NetworkError) {
        toast.error('No se pudo conectar al servidor', {
          description:
            'La cancelación no se aplicó. Reintenta cuando el backend esté disponible.',
        })
        return
      }
      if (error instanceof ApiError) {
        toast.error(error.title, { description: error.detail })
        return
      }
      toast.error('No se pudo cancelar la venta')
    },
  })
}
