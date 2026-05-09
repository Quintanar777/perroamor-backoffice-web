import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { catalogKeys, productsApi, variantsApi } from '@/lib/api/catalog'
import type {
  ProductVariant,
  ProductVariantInput,
} from '@/lib/types/catalog'

export function useProductQuery(productId: number) {
  return useQuery({
    queryKey: catalogKeys.product(productId),
    queryFn: () => productsApi.get(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  })
}

export function useVariantsQuery(productId: number) {
  return useQuery({
    queryKey: catalogKeys.variants(productId),
    queryFn: () => variantsApi.list(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  })
}

const invalidateAll = (qc: ReturnType<typeof useQueryClient>, productId: number) => {
  qc.invalidateQueries({ queryKey: catalogKeys.variants(productId) })
  qc.invalidateQueries({ queryKey: ['catalog', 'products'] })
}

export function useCreateVariant(productId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ProductVariantInput) => variantsApi.create(productId, body),
    onSuccess: (variant) => {
      invalidateAll(qc, productId)
      toast.success('Variante creada', { description: variant.variantName })
    },
  })
}

export function useUpdateVariant(productId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ProductVariantInput }) =>
      variantsApi.update(productId, id, body),
    onSuccess: (variant) => {
      invalidateAll(qc, productId)
      toast.success('Variante actualizada', { description: variant.variantName })
    },
  })
}

export function useDeleteVariant(productId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (variant: ProductVariant) =>
      variantsApi.remove(productId, variant.id),
    onSuccess: (_, variant) => {
      invalidateAll(qc, productId)
      toast.success('Variante eliminada', { description: variant.variantName })
    },
  })
}
