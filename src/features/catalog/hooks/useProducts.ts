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

// Backend caps page size at 200. Removing variants means each size is now
// its own product, so a single page can silently truncate the catalog — loop
// while there are more pages, up to a hard cap to avoid runaway requests.
const MAX_CATALOG_PAGES = 10

async function fetchAllActiveProducts(): Promise<Product[]> {
  const all: Product[] = []
  let page = 0
  let totalPages = 1
  while (page < totalPages && page < MAX_CATALOG_PAGES) {
    const response = await productsApi.list({
      isActive: true,
      page,
      size: 200,
    })
    all.push(...response.content)
    totalPages = response.totalPages
    page += 1
  }
  return all
}

export function useAllProductsQuery() {
  return useQuery({
    queryKey: ['catalog', 'all-products'] as const,
    queryFn: fetchAllActiveProducts,
    staleTime: 60_000,
  })
}

export function useProductCategoriesQuery() {
  return useQuery({
    queryKey: ['catalog', 'product-categories'] as const,
    queryFn: async () => {
      const products = await fetchAllActiveProducts()
      const set = new Set<string>()
      for (const p of products) if (p.category) set.add(p.category)
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

export function useBackfillCodes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => productsApi.backfillCodes(),
    onSuccess: (updated) => {
      invalidateProducts(qc)
      toast.success(
        updated.length > 0
          ? `Códigos generados para ${updated.length} producto(s)`
          : 'Todos los productos ya tenían código',
      )
    },
  })
}

export function useRegenerateCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productsApi.regenerateCode(id),
    onSuccess: (product) => {
      invalidateProducts(qc)
      toast.success('Código regenerado', { description: product.code ?? undefined })
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
