import { apiGet, apiPatch, apiPost } from '@/lib/api/client'
import type { PagedResponse } from '@/lib/types/api'
import type {
  Sale,
  SaleFilters,
  SaleInput,
  SaleStats,
} from '@/lib/types/sale'

export const salesApi = {
  list: (filters: SaleFilters = {}): Promise<PagedResponse<Sale>> =>
    apiGet<PagedResponse<Sale>>('/sales', {
      query: filters as Record<string, unknown>,
    }),
  get: (id: number): Promise<Sale> => apiGet<Sale>(`/sales/${id}`),
  create: (body: SaleInput): Promise<Sale> => apiPost<Sale>('/sales', body),
  cancel: (id: number): Promise<Sale> => apiPatch<Sale>(`/sales/${id}/cancel`),
  stats: (eventId: number): Promise<SaleStats> =>
    apiGet<SaleStats>('/sales/stats', { query: { eventId } }),
}

export const salesKeys = {
  list: (filters: SaleFilters = {}) => ['sales', 'list', filters] as const,
  detail: (id: number) => ['sales', 'detail', id] as const,
  stats: (eventId: number) => ['sales', 'stats', eventId] as const,
}
