import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { catalogKeys, combosApi } from '@/lib/api/catalog'
import type {
  Combo,
  ComboFilters,
  ComboInput,
} from '@/lib/types/catalog'

export function useCombosQuery(filters: ComboFilters) {
  return useQuery({
    queryKey: catalogKeys.combos(filters),
    queryFn: () => combosApi.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useComboQuery(id: number) {
  return useQuery({
    queryKey: catalogKeys.combo(id),
    queryFn: () => combosApi.get(id),
    enabled: Number.isFinite(id) && id > 0,
  })
}

const invalidateCombos = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['catalog', 'combos'] })
}

export function useCreateCombo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: ComboInput) => combosApi.create(body),
    onSuccess: (combo) => {
      invalidateCombos(qc)
      toast.success('Combo creado', { description: combo.name })
    },
  })
}

export function useUpdateCombo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: ComboInput }) =>
      combosApi.update(id, body),
    onSuccess: (combo) => {
      invalidateCombos(qc)
      toast.success('Combo actualizado', { description: combo.name })
    },
  })
}

export function useDeleteCombo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (combo: Combo) => combosApi.remove(combo.id),
    onSuccess: (_, combo) => {
      invalidateCombos(qc)
      toast.success('Combo eliminado', { description: combo.name })
    },
  })
}
