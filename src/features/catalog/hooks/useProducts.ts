import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { catalogKeys, productsApi } from '@/lib/api/catalog'
import type {
  Product,
  ProductFilters,
  ProductInput,
} from '@/lib/types/catalog'

export function useProductsQuery(filters: ProductFilters) {
  return useQuery({
    queryKey: catalogKeys.products(filters),
    queryFn: () => productsApi.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useAllProductsQuery() {
  return useQuery({
    queryKey: ['catalog', 'all-products'] as const,
    queryFn: async () => {
      // Backend caps page size at 200. Para >200 productos, mover a un endpoint
      // dedicado o paginar internamente cuando el ComboBuilder lo necesite.
      const page = await productsApi.list({ page: 0, size: 200 })
      return page.content
    },
    staleTime: 60_000,
  })
}

export function useProductCategoriesQuery() {
  return useQuery({
    queryKey: ['catalog', 'product-categories'] as const,
    queryFn: async () => {
      // Backend caps page size at 200. Para >200 productos, mover esto a un
      // endpoint dedicado /products/categories en el backend.
      const page = await productsApi.list({ page: 0, size: 200 })
      const set = new Set<string>()
      for (const p of page.content) if (p.category) set.add(p.category)
      return [...set].sort((a, b) => a.localeCompare(b, 'es'))
    },
    staleTime: 5 * 60_000,
  })
}

const invalidateProducts = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['catalog', 'products'] })
  qc.invalidateQueries({ queryKey: ['catalog', 'product-categories'] })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ProductInput) => productsApi.create(body),
    onSuccess: (product) => {
      invalidateProducts(qc)
      toast.success('Producto creado', { description: product.name })
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ProductInput }) =>
      productsApi.update(id, body),
    onSuccess: (product) => {
      invalidateProducts(qc)
      toast.success('Producto actualizado', { description: product.name })
    },
  })
}

export function usePatchStock() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, setTo }: { id: number; setTo: number }) =>
      productsApi.patchStock(id, setTo),
    onSuccess: () => {
      invalidateProducts(qc)
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (product: Product) => productsApi.remove(product.id),
    onSuccess: (_, product) => {
      invalidateProducts(qc)
      toast.success('Producto eliminado', { description: product.name })
    },
  })
}
