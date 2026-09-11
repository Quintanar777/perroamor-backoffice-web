import { Plus, Trash2 } from 'lucide-react'
import {
  useFieldArray,
  useWatch,
  type Control,
  type UseFormSetValue,
} from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DiscountSlotRow } from '@/features/discounts/components/DiscountSlotRow'
import {
  emptyDiscountOption,
  emptyDiscountSlot,
  type DiscountFormInput,
} from '@/features/discounts/schemas/discountSchema'
import type { Product } from '@/lib/types/catalog'

interface BuilderProps {
  control: Control<DiscountFormInput>
  setValue: UseFormSetValue<DiscountFormInput>
  products: Product[]
  disabled?: boolean
}

export function DiscountSlotBuilder({
  control,
  setValue,
  products,
  disabled,
}: BuilderProps) {
  const slots = useFieldArray({ control, name: 'slots' })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base">Slots del descuento</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => slots.append(structuredClone(emptyDiscountSlot))}
        >
          <Plus className="size-4" />
          Agregar slot
        </Button>
      </div>

      {slots.fields.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Agregá al menos un slot fijo o de grupo.
        </p>
      )}

      <div className="space-y-4">
        {slots.fields.map((slotField, slotIndex) => (
          <SlotCard
            key={slotField.id}
            control={control}
            setValue={setValue}
            slotIndex={slotIndex}
            products={products}
            disabled={disabled}
            onRemoveSlot={() => slots.remove(slotIndex)}
            removableSlot={slots.fields.length > 1}
          />
        ))}
      </div>
    </div>
  )
}

interface SlotCardProps {
  control: Control<DiscountFormInput>
  setValue: UseFormSetValue<DiscountFormInput>
  slotIndex: number
  products: Product[]
  disabled?: boolean
  onRemoveSlot: () => void
  removableSlot: boolean
}

function SlotCard({
  control,
  setValue,
  slotIndex,
  products,
  disabled,
  onRemoveSlot,
  removableSlot,
}: SlotCardProps) {
  const options = useFieldArray({
    control,
    name: `slots.${slotIndex}.options`,
  })
  const slotType = useWatch({ control, name: `slots.${slotIndex}.slotType` })

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <FormField
          control={control}
          name={`slots.${slotIndex}.slotType`}
          render={({ field }) => (
            <FormItem>
              <ToggleGroup
                type="single"
                variant="outline"
                value={field.value}
                onValueChange={(v) => {
                  if (!v) return
                  field.onChange(v)
                  if (v === 'FIXED') {
                    // A fixed slot has exactly one option and no quantity
                    // choice beyond a positive integer.
                    while (options.fields.length > 1) {
                      options.remove(options.fields.length - 1)
                    }
                  } else {
                    setValue(`slots.${slotIndex}.quantity`, '1')
                  }
                }}
                disabled={disabled}
              >
                <ToggleGroupItem value="FIXED">Fijo</ToggleGroupItem>
                <ToggleGroupItem value="GROUP">Grupo</ToggleGroupItem>
              </ToggleGroup>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`slots.${slotIndex}.quantity`}
          render={({ field }) => (
            <FormItem className="w-24">
              <FormLabel className="text-xs">Cantidad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min={1}
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
          aria-label="Quitar slot"
          className="text-destructive hover:text-destructive"
          onClick={onRemoveSlot}
          disabled={disabled || !removableSlot}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {options.fields.map((optionField, optionIndex) => (
          <DiscountSlotRow
            key={optionField.id}
            control={control}
            slotIndex={slotIndex}
            optionIndex={optionIndex}
            products={products}
            disabled={disabled}
            removable={options.fields.length > 1}
            onRemove={() => options.remove(optionIndex)}
          />
        ))}
      </div>

      {slotType === 'GROUP' && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => options.append({ ...emptyDiscountOption })}
        >
          <Plus className="size-4" />
          Agregar opción del grupo
        </Button>
      )}
    </div>
  )
}
