import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { discountKeys, discountsApi } from '@/lib/api/discounts'
import type { Discount, DiscountFilters, DiscountInput } from '@/lib/types/discount'

export function useDiscountsQuery(filters: DiscountFilters) {
  return useQuery({
    queryKey: discountKeys.discounts(filters),
    queryFn: () => discountsApi.list(filters),
    placeholderData: keepPreviousData,
  })
}

const invalidateDiscounts = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['discounts'] })
}

export function useCreateDiscount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: DiscountInput) => discountsApi.create(body),
    onSuccess: (discount) => {
      invalidateDiscounts(qc)
      toast.success('Descuento creado', { description: discount.name })
    },
  })
}

export function useUpdateDiscount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: DiscountInput }) =>
      discountsApi.update(id, body),
    onSuccess: (discount) => {
      invalidateDiscounts(qc)
      toast.success('Descuento actualizado', { description: discount.name })
    },
  })
}

export function useDeleteDiscount() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (discount: Discount) => discountsApi.remove(discount.id),
    onSuccess: (_, discount) => {
      invalidateDiscounts(qc)
      toast.success('Descuento eliminado', { description: discount.name })
    },
  })
}
