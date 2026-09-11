import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useAllProductsQuery } from '@/features/catalog/hooks/useProducts'
import { DiscountSlotBuilder } from '@/features/discounts/components/DiscountSlotBuilder'
import {
  useCreateDiscount,
  useUpdateDiscount,
} from '@/features/discounts/hooks/useDiscounts'
import {
  discountSchema,
  emptyDiscountSlot,
  type DiscountFormInput,
} from '@/features/discounts/schemas/discountSchema'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import type { Discount, DiscountInput } from '@/lib/types/discount'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  discount: Discount | null
}

const KNOWN_FIELDS = ['name', 'description', 'totalPrice'] as const

const emptyDefaults: DiscountFormInput = {
  name: '',
  description: '',
  totalPrice: '',
  isActive: true,
  slots: [structuredClone(emptyDiscountSlot)],
}

export function DiscountFormDialog({ open, onOpenChange, discount }: Props) {
  const isEdit = discount !== null
  const create = useCreateDiscount()
  const update = useUpdateDiscount()
  const pending = create.isPending || update.isPending
  const productsQuery = useAllProductsQuery()

  const form = useForm<DiscountFormInput>({
    resolver: zodResolver(discountSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      discount
        ? {
            name: discount.name,
            description: discount.description ?? '',
            totalPrice: String(discount.totalPrice),
            isActive: discount.isActive,
            slots: discount.slots.map((slot) => ({
              slotType: slot.slotType,
              quantity: String(slot.quantity),
              options: slot.options.map((o) => ({
                productId: String(o.productId),
                finalUnitPrice: String(o.finalUnitPrice),
              })),
            })),
          }
        : emptyDefaults,
    )
  }, [discount, open, form])

  const onSubmit = form.handleSubmit(async (values) => {
    const description = values.description.trim()
    const body: DiscountInput = {
      name: values.name.trim(),
      description: description.length > 0 ? description : null,
      totalPrice: Number(values.totalPrice),
      isActive: values.isActive,
      slots: values.slots.map((slot, position) => ({
        position,
        slotType: slot.slotType,
        quantity: Number(slot.quantity),
        options: slot.options.map((o) => ({
          productId: Number(o.productId),
          finalUnitPrice: Number(o.finalUnitPrice),
        })),
      })),
    }
    try {
      if (discount) {
        await update.mutateAsync({ id: discount.id, body })
      } else {
        await create.mutateAsync(body)
      }
      onOpenChange(false)
    } catch (error) {
      applyServerErrors(error, {
        setError: (field, err) => form.setError(field as keyof DiscountFormInput, err),
        knownFields: [...KNOWN_FIELDS],
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar descuento' : 'Nuevo descuento'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualizá los datos del descuento.'
              : 'Definí un descuento con slots fijos o de grupo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input autoFocus disabled={pending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={pending}
                        placeholder="Opcional"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio total</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min={0}
                        disabled={pending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEdit && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <FormLabel>Descuento activo</FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value ?? true}
                          onCheckedChange={field.onChange}
                          disabled={pending}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <DiscountSlotBuilder
              control={form.control}
              setValue={form.setValue}
              products={productsQuery.data ?? []}
              disabled={pending}
            />
            {form.formState.errors.slots?.root?.message && (
              <p className="text-destructive text-sm">
                {form.formState.errors.slots.root.message}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="size-4 animate-spin" />}
                {isEdit ? 'Guardar cambios' : 'Crear descuento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
