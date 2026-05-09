import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ComboItemRow } from '@/features/catalog/components/ComboItemRow'
import {
  findDuplicateItemIndices,
  type ComboFormInput,
} from '@/features/catalog/schemas/comboSchema'
import type { Product } from '@/lib/types/catalog'

interface Props {
  products: Product[]
  productsLoading: boolean
  disabled?: boolean
}

export function ComboBuilder({ products, productsLoading, disabled }: Props) {
  const { control, formState } = useFormContext<ComboFormInput>()
  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const items = useWatch({ control, name: 'items' }) ?? []
  const duplicates = new Set(findDuplicateItemIndices(items))
  const itemsError = formState.errors.items
  const rootMessage =
    typeof itemsError?.message === 'string' ? itemsError.message : undefined

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium">Componentes</h3>
          <p className="text-muted-foreground text-xs">
            Cada componente descuenta stock real al venderse.
          </p>
        </div>
        <Badge variant="secondary">
          {fields.length} {fields.length === 1 ? 'componente' : 'componentes'}
        </Badge>
      </div>

      {productsLoading && fields.length === 0 ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <ComboItemRow
              key={field.id}
              index={index}
              products={products}
              productsLoading={productsLoading}
              onRemove={() => remove(index)}
              duplicate={duplicates.has(index)}
              disabled={disabled}
            />
          ))}
        </div>
      )}

      {rootMessage && <p className="text-destructive text-sm">{rootMessage}</p>}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({ productId: '', variantId: '', quantity: '1' })
        }
        disabled={disabled}
      >
        <Plus className="size-4" />
        Agregar componente
      </Button>
    </div>
  )
}
