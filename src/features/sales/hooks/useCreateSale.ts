import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { salesApi } from '@/lib/api/sales'
import { ApiError, NetworkError } from '@/lib/types/api'
import type { SaleInput } from '@/lib/types/sale'

export function useCreateSale() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SaleInput) => salesApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['catalog', 'products'] })
      qc.invalidateQueries({ queryKey: ['catalog', 'combos'] })
      qc.invalidateQueries({ queryKey: ['catalog', 'all-products'] })
      qc.invalidateQueries({ queryKey: ['sales'] })
    },
    onError: (error) => {
      if (error instanceof NetworkError) {
        toast.error('No se pudo conectar al servidor', {
          description:
            'La venta no se registró. Verifica que el backend esté disponible.',
        })
        return
      }
      if (error instanceof ApiError) {
        toast.error(error.title, { description: error.detail })
        return
      }
      toast.error('No se pudo registrar la venta', {
        description: error instanceof Error ? error.message : undefined,
      })
    },
  })
}
