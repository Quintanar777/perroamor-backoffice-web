import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '@/lib/api/client'
import type { PagedResponse } from '@/lib/types/api'
import type {
  Brand,
  BrandInput,
  Combo,
  ComboFilters,
  ComboInput,
  Product,
  ProductFilters,
  ProductInput,
  ProductVariant,
  ProductVariantInput,
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
}

export const variantsApi = {
  list: (productId: number): Promise<ProductVariant[]> =>
    apiGet<ProductVariant[]>(`/products/${productId}/variants`),
  create: (productId: number, body: ProductVariantInput): Promise<ProductVariant> =>
    apiPost<ProductVariant>(`/products/${productId}/variants`, body),
  update: (
    _productId: number,
    variantId: number,
    body: ProductVariantInput,
  ): Promise<ProductVariant> =>
    apiPut<ProductVariant>(`/variants/${variantId}`, body),
  remove: (_productId: number, variantId: number): Promise<void> =>
    apiDelete<void>(`/variants/${variantId}`),
}

export const combosApi = {
  list: (filters: ComboFilters = {}): Promise<PagedResponse<Combo>> =>
    apiGet<PagedResponse<Combo>>('/combos', {
      query: filters as Record<string, unknown>,
    }),
  get: (id: number): Promise<Combo> => apiGet<Combo>(`/combos/${id}`),
  create: (body: ComboInput): Promise<Combo> => apiPost<Combo>('/combos', body),
  update: (id: number, body: ComboInput): Promise<Combo> =>
    apiPut<Combo>(`/combos/${id}`, body),
  remove: (id: number): Promise<void> => apiDelete<void>(`/combos/${id}`),
}

export const catalogKeys = {
  brands: () => ['catalog', 'brands'] as const,
  brand: (id: number) => ['catalog', 'brands', id] as const,
  products: (filters: ProductFilters = {}) => ['catalog', 'products', filters] as const,
  product: (id: number) => ['catalog', 'products', id] as const,
  variants: (productId: number) => ['catalog', 'variants', productId] as const,
  combos: (filters: ComboFilters = {}) => ['catalog', 'combos', filters] as const,
  combo: (id: number) => ['catalog', 'combos', id] as const,
}
