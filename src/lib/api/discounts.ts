import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client'
import type { PagedResponse } from '@/lib/types/api'
import type { Discount, DiscountFilters, DiscountInput } from '@/lib/types/discount'

export const discountsApi = {
  list: (filters: DiscountFilters = {}): Promise<PagedResponse<Discount>> =>
    apiGet<PagedResponse<Discount>>('/discounts', {
      query: filters as Record<string, unknown>,
    }),
  get: (id: number): Promise<Discount> => apiGet<Discount>(`/discounts/${id}`),
  create: (body: DiscountInput): Promise<Discount> =>
    apiPost<Discount>('/discounts', body),
  update: (id: number, body: DiscountInput): Promise<Discount> =>
    apiPut<Discount>(`/discounts/${id}`, body),
  remove: (id: number): Promise<void> => apiDelete<void>(`/discounts/${id}`),
}

export const discountKeys = {
  discounts: (filters: DiscountFilters = {}) => ['discounts', filters] as const,
  discount: (id: number) => ['discounts', id] as const,
}
