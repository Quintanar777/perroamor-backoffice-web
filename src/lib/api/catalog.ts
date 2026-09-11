import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/lib/api/client'
import type { PagedResponse } from '@/lib/types/api'
import type {
  Brand,
  BrandInput,
  CatalogLookupResult,
  Product,
  ProductFilters,
  ProductInput,
} from '@/lib/types/catalog'

export const brandsApi = {
  list: (): Promise<Brand[]> => apiGet<Brand[]>('/brands'),
  get: (id: number): Promise<Brand> => apiGet<Brand>(`/brands/${id}`),
  create: (body: BrandInput): Promise<Brand> => apiPost<Brand>('/brands', body),
  update: (id: number, body: BrandInput): Promise<Brand> =>
    apiPut<Brand>(`/brands/${id}`, body),
  remove: (id: number): Promise<void> => apiDelete<void>(`/brands/${id}`),
}

export const productsApi = {
  list: (filters: ProductFilters = {}): Promise<PagedResponse<Product>> =>
    apiGet<PagedResponse<Product>>('/products', {
      query: filters as Record<string, unknown>,
    }),
  get: (id: number): Promise<Product> => apiGet<Product>(`/products/${id}`),
  create: (body: ProductInput): Promise<Product> => apiPost<Product>('/products', body),
  update: (id: number, body: ProductInput): Promise<Product> =>
    apiPut<Product>(`/products/${id}`, body),
  remove: (id: number): Promise<void> => apiDelete<void>(`/products/${id}`),
  patchStock: (id: number, setTo: number): Promise<Product> =>
    apiPatch<Product>(`/products/${id}/stock`, { delta: 0, setTo }),
  backfillCodes: (): Promise<Product[]> =>
    apiPost<Product[]>('/products/backfill-codes'),
  regenerateCode: (id: number): Promise<Product> =>
    apiPatch<Product>(`/products/${id}/regenerate-code`),
}

export const catalogLookupApi = {
  byCode: (code: string): Promise<CatalogLookupResult> =>
    apiGet<CatalogLookupResult>('/catalog/lookup', { query: { code } }),
}

export const catalogKeys = {
  brands: () => ['catalog', 'brands'] as const,
  brand: (id: number) => ['catalog', 'brands', id] as const,
  products: (filters: ProductFilters = {}) => ['catalog', 'products', filters] as const,
  product: (id: number) => ['catalog', 'products', id] as const,
}
