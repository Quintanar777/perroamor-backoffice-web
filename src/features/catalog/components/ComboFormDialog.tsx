import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { ComboBuilder } from '@/features/catalog/components/ComboBuilder'
import { useBrandsQuery } from '@/features/catalog/hooks/useBrands'
import {
  useCreateCombo,
  useUpdateCombo,
} from '@/features/catalog/hooks/useCombos'
import { useAllProductsQuery } from '@/features/catalog/hooks/useProducts'
import {
  comboSchema,
  findDuplicateItemIndices,
  type ComboFormInput,
} from '@/features/catalog/schemas/comboSchema'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import type { Combo } from '@/lib/types/catalog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  combo: Combo | null
}

const KNOWN_FIELDS = [
  'name',
  'description',
  'brandId',
  'price',
  'wholesalePrice',
  'isActive',
  'items',
] as const

const emptyDefaults: ComboFormInput = {
  name: '',
  description: '',
  brandId: '',
  price: '',
  wholesalePrice: '',
  isActive: true,
  items: [],
}

export function ComboFormDialog({ open, onOpenChange, combo }: Props) {
  const isEdit = combo !== null
  const create = useCreateCombo()
  const update = useUpdateCombo()
  const brandsQuery = useBrandsQuery()
  const productsQuery = useAllProductsQuery()
  const pending = create.isPending || update.isPending

  const form = useForm<ComboFormInput>({
    resolver: zodResolver(comboSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      combo
        ? {
            name: combo.name,
            description: combo.description ?? '',
            brandId: String(combo.brandId),
            price: String(combo.price),
            wholesalePrice: String(combo.wholesalePrice),
            isActive: combo.isActive,
            items: combo.items.map((it) => ({
              productId: String(it.productId),
              variantId: it.variantId !== null ? String(it.variantId) : '',
              quantity: String(it.quantity),
            })),
          }
        : { ...emptyDefaults, items: [] },
    )
  }, [combo, open, form])

  const products = productsQuery.data ?? []
  const brands = brandsQuery.data ?? []

  const onSubmit = form.handleSubmit(async (values) => {
    const dupes = findDuplicateItemIndices(values.items)
    if (dupes.length > 0) {
      for (const idx of dupes) {
        form.setError(`items.${idx}.productId`, {
          message: 'Componente duplicado',
        })
      }
      return
    }

    const description = values.description.trim()
    const body = {
      name: values.name.trim(),
      description: description.length > 0 ? description : null,
      brandId: Number(values.brandId),
      price: Number(values.price),
      wholesalePrice: Number(values.wholesalePrice),
      isActive: values.isActive,
      items: values.items.map((it) => ({
        productId: Number(it.productId),
        variantId: it.variantId.length > 0 ? Number(it.variantId) : null,
        quantity: Number(it.quantity),
      })),
    }

    try {
      if (combo) {
        await update.mutateAsync({ id: combo.id, body })
      } else {
        await create.mutateAsync(body)
      }
      onOpenChange(false)
    } catch (error) {
      applyServerErrors(error, {
        setError: (field, err) =>
          form.setError(field as keyof ComboFormInput, err),
        knownFields: [...KNOWN_FIELDS],
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] w-full flex-col gap-0 p-0 sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{isEdit ? 'Editar combo' : 'Nuevo combo'}</DialogTitle>
          <DialogDescription>
            Define los componentes; el stock disponible lo calcula el backend.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <Form {...form}>
            <form
              onSubmit={onSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
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
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={pending || brandsQuery.isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Elige una marca" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands
                              .filter((b) => b.isActive || b.id === combo?.brandId)
                              .map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>
                                  {b.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio</FormLabel>
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
                        <FormDescription>
                          Precio fijo del combo, no se calcula desde componentes.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="wholesalePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio mayoreo</FormLabel>
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
                            rows={3}
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
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:col-span-2">
                          <div className="space-y-0.5">
                            <FormLabel>Combo activo</FormLabel>
                            <FormDescription className="text-xs">
                              Si está inactivo no aparece en el POS.
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

                <ComboBuilder
                  products={products}
                  productsLoading={productsQuery.isLoading}
                  disabled={pending}
                />
              </div>

              <DialogFooter className="border-t px-6 py-4 sm:flex-row sm:justify-end">
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
                  {isEdit ? 'Guardar cambios' : 'Crear combo'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
