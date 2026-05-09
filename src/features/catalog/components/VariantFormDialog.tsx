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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  useCreateVariant,
  useUpdateVariant,
} from '@/features/catalog/hooks/useVariants'
import {
  variantSchema,
  type VariantFormInput,
} from '@/features/catalog/schemas/variantSchema'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import type { ProductVariant } from '@/lib/types/catalog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: number
  variant: ProductVariant | null
}

const KNOWN_FIELDS = [
  'variantName',
  'color',
  'size',
  'design',
  'material',
  'sku',
  'stock',
  'priceAdjustment',
  'isActive',
] as const

const emptyDefaults: VariantFormInput = {
  variantName: '',
  color: '',
  size: '',
  design: '',
  material: '',
  sku: '',
  stock: '0',
  priceAdjustment: '0',
  isActive: true,
}

export function VariantFormDialog({ open, onOpenChange, productId, variant }: Props) {
  const isEdit = variant !== null
  const create = useCreateVariant(productId)
  const update = useUpdateVariant(productId)
  const pending = create.isPending || update.isPending

  const form = useForm<VariantFormInput>({
    resolver: zodResolver(variantSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      variant
        ? {
            variantName: variant.variantName,
            color: variant.color ?? '',
            size: variant.size ?? '',
            design: variant.design ?? '',
            material: variant.material ?? '',
            sku: variant.sku,
            stock: String(variant.stock),
            priceAdjustment: String(variant.priceAdjustment),
            isActive: variant.isActive,
          }
        : emptyDefaults,
    )
  }, [variant, open, form])

  const optional = (s: string) => {
    const trimmed = s.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const body = {
      variantName: values.variantName.trim(),
      color: optional(values.color),
      size: optional(values.size),
      design: optional(values.design),
      material: optional(values.material),
      sku: values.sku.trim(),
      stock: Number(values.stock),
      priceAdjustment: Number(values.priceAdjustment),
      isActive: values.isActive,
    }
    try {
      if (variant) {
        await update.mutateAsync({ id: variant.id, body })
      } else {
        await create.mutateAsync(body)
      }
      onOpenChange(false)
    } catch (error) {
      applyServerErrors(error, {
        setError: (field, err) => form.setError(field as keyof VariantFormInput, err),
        knownFields: [...KNOWN_FIELDS],
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar variante' : 'Nueva variante'}</DialogTitle>
          <DialogDescription>
            Color, talla, diseño o material distinguen una variante.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="variantName"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Nombre de la variante</FormLabel>
                    <FormControl>
                      <Input autoFocus disabled={pending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input
                        disabled={pending}
                        autoCapitalize="characters"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Código único de inventario.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        step="1"
                        min={0}
                        disabled={pending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <Input
                        disabled={pending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Talla</FormLabel>
                    <FormControl>
                      <Input
                        disabled={pending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="design"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diseño</FormLabel>
                    <FormControl>
                      <Input
                        disabled={pending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <FormControl>
                      <Input
                        disabled={pending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceAdjustment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ajuste de precio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        disabled={pending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Suma o resta sobre el precio base. Usa negativo para descuento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isEdit && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:col-span-2">
                      <div className="space-y-0.5">
                        <FormLabel>Variante activa</FormLabel>
                        <FormDescription className="text-xs">
                          Si está inactiva no se puede vender en el POS.
                        </FormDescription>
                      </div>
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
                {isEdit ? 'Guardar cambios' : 'Crear variante'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
