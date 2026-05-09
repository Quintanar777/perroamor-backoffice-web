import { Minus, Plus, Trash2 } from 'lucide-react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useVariantsQuery } from '@/features/catalog/hooks/useVariants'
import type { ComboFormInput } from '@/features/catalog/schemas/comboSchema'
import { formatMoney } from '@/lib/format'
import type { Product } from '@/lib/types/catalog'
import { cn } from '@/lib/utils'

interface Props {
  index: number
  products: Product[]
  productsLoading: boolean
  onRemove: () => void
  duplicate: boolean
  disabled?: boolean
}

const NO_VARIANT = '__none__'

export function ComboItemRow({
  index,
  products,
  productsLoading,
  onRemove,
  duplicate,
  disabled,
}: Props) {
  const { control, setValue, getValues, formState } = useFormContext<ComboFormInput>()
  const productId = useWatch({ control, name: `items.${index}.productId` })
  const numericProductId = Number(productId)
  const selectedProduct = products.find((p) => p.id === numericProductId)
  const productHasVariants = selectedProduct?.hasVariants ?? false

  const variantsQuery = useVariantsQuery(productHasVariants ? numericProductId : 0)
  const variants = variantsQuery.data ?? []

  const fieldErrors = formState.errors.items?.[index]
  const productError = fieldErrors?.productId?.message
  const quantityError = fieldErrors?.quantity?.message

  const handleProductChange = (newId: string) => {
    setValue(`items.${index}.productId`, newId, { shouldValidate: true })
    setValue(`items.${index}.variantId`, '', { shouldValidate: true })
  }

  const handleQtyStep = (delta: number) => {
    const current = Number(getValues(`items.${index}.quantity`)) || 0
    const next = Math.max(1, current + delta)
    setValue(`items.${index}.quantity`, String(next), { shouldValidate: true })
  }

  return (
    <div
      className={cn(
        'space-y-3 rounded-lg border p-3',
        duplicate && 'border-destructive bg-destructive/5',
      )}
    >
      <div className="space-y-1">
        <Controller
          control={control}
          name={`items.${index}.productId`}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={handleProductChange}
              disabled={disabled || productsLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Elegí un producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {selectedProduct && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="font-normal">
              {selectedProduct.brandName}
            </Badge>
            <span>{formatMoney(selectedProduct.price)}</span>
            {!selectedProduct.hasVariants && (
              <span>· stock {selectedProduct.stock}</span>
            )}
            {selectedProduct.hasVariants && (
              <span>· stock por variante</span>
            )}
          </div>
        )}
        {(productError || duplicate) && (
          <p className="text-destructive text-xs">
            {productError ?? 'Componente duplicado'}
          </p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)_auto] sm:items-end">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Variante</p>
          <Controller
            control={control}
            name={`items.${index}.variantId`}
            render={({ field }) => (
              <Select
                value={field.value === '' ? NO_VARIANT : field.value}
                onValueChange={(v) =>
                  field.onChange(v === NO_VARIANT ? '' : v)
                }
                disabled={
                  disabled ||
                  !productHasVariants ||
                  variantsQuery.isLoading ||
                  variants.length === 0
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      !selectedProduct
                        ? 'Sin producto'
                        : !productHasVariants
                          ? 'Sin variantes'
                          : 'Cualquier variante'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_VARIANT}>Cualquier variante</SelectItem>
                  {variants
                    .filter((v) => v.isActive)
                    .map((v) => (
                      <SelectItem key={v.id} value={String(v.id)}>
                        {v.variantName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1">
          <p className="text-muted-foreground text-xs">Cantidad</p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Disminuir cantidad"
              onClick={() => handleQtyStep(-1)}
              disabled={disabled}
            >
              <Minus className="size-4" />
            </Button>
            <Controller
              control={control}
              name={`items.${index}.quantity`}
              render={({ field }) => (
                <Input
                  className="text-center tabular-nums"
                  inputMode="numeric"
                  disabled={disabled}
                  {...field}
                />
              )}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Aumentar cantidad"
              onClick={() => handleQtyStep(1)}
              disabled={disabled}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          {quantityError && (
            <p className="text-destructive text-xs">{quantityError}</p>
          )}
        </div>

        <div className="flex sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Eliminar componente"
            onClick={onRemove}
            disabled={disabled}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
