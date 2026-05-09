import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { brandsApi, catalogKeys } from '@/lib/api/catalog'
import type { Brand, BrandInput } from '@/lib/types/catalog'

export function useBrandsQuery() {
  return useQuery({
    queryKey: catalogKeys.brands(),
    queryFn: brandsApi.list,
  })
}

export function useCreateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: BrandInput) => brandsApi.create(body),
    onSuccess: (brand) => {
      qc.invalidateQueries({ queryKey: catalogKeys.brands() })
      toast.success('Marca creada', { description: brand.name })
    },
  })
}

export function useUpdateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: BrandInput }) =>
      brandsApi.update(id, body),
    onSuccess: (brand) => {
      qc.invalidateQueries({ queryKey: catalogKeys.brands() })
      toast.success('Marca actualizada', { description: brand.name })
    },
  })
}

export function useDeleteBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (brand: Brand) => brandsApi.remove(brand.id),
    onSuccess: (_, brand) => {
      qc.invalidateQueries({ queryKey: catalogKeys.brands() })
      toast.success('Marca eliminada', { description: brand.name })
    },
  })
}
