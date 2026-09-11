import { X } from 'lucide-react'
import type { Control } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DiscountFormInput } from '@/features/discounts/schemas/discountSchema'
import type { Product } from '@/lib/types/catalog'

interface Props {
  control: Control<DiscountFormInput>
  slotIndex: number
  optionIndex: number
  products: Product[]
  disabled?: boolean
  onRemove: () => void
  removable: boolean
}

export function DiscountSlotRow({
  control,
  slotIndex,
  optionIndex,
  products,
  disabled,
  onRemove,
  removable,
}: Props) {
  return (
    <div className="flex items-start gap-2">
      <FormField
        control={control}
        name={`slots.${slotIndex}.options.${optionIndex}.productId`}
        render={({ field }) => (
          <FormItem className="min-w-0 flex-1">
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Elegí un producto" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.size ? `${p.name} - ${p.size}` : p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`slots.${slotIndex}.options.${optionIndex}.finalUnitPrice`}
        render={({ field }) => (
          <FormItem className="w-28">
            <FormControl>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                placeholder="Precio"
                disabled={disabled}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Quitar producto"
        onClick={onRemove}
        disabled={disabled || !removable}
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}
