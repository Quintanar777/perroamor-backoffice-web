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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBrandsQuery } from '@/features/catalog/hooks/useBrands'
import {
  useCreateProduct,
  useUpdateProduct,
} from '@/features/catalog/hooks/useProducts'
import {
  productSchema,
  type ProductFormInput,
} from '@/features/catalog/schemas/productSchema'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import type { Product } from '@/lib/types/catalog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

const KNOWN_FIELDS = [
  'name',
  'brandId',
  'category',
  'price',
  'wholesalePrice',
  'stock',
  'description',
  'canBePersonalized',
  'hasVariants',
  'isActive',
] as const

const emptyDefaults: ProductFormInput = {
  name: '',
  brandId: '',
  category: '',
  price: '',
  wholesalePrice: '',
  stock: '0',
  description: '',
  canBePersonalized: false,
  hasVariants: false,
  isActive: true,
}

export function ProductFormDialog({ open, onOpenChange, product }: Props) {
  const isEdit = product !== null
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const brandsQuery = useBrandsQuery()
  const pending = create.isPending || update.isPending

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      product
        ? {
            name: product.name,
            brandId: String(product.brandId),
            category: product.category,
            price: String(product.price),
            wholesalePrice: String(product.wholesalePrice),
            stock: String(product.stock),
            description: product.description ?? '',
            canBePersonalized: product.canBePersonalized,
            hasVariants: product.hasVariants,
            isActive: product.isActive,
          }
        : emptyDefaults,
    )
  }, [product, open, form])

  const onSubmit = form.handleSubmit(async (values) => {
    const description = values.description.trim()
    const body = {
      name: values.name.trim(),
      brandId: Number(values.brandId),
      category: values.category.trim(),
      price: Number(values.price),
      wholesalePrice: Number(values.wholesalePrice),
      stock: Number(values.stock),
      description: description.length > 0 ? description : null,
      canBePersonalized: values.canBePersonalized,
      hasVariants: values.hasVariants,
      isActive: values.isActive,
    }
    try {
      if (product) {
        await update.mutateAsync({ id: product.id, body })
      } else {
        await create.mutateAsync(body)
      }
      onOpenChange(false)
    } catch (error) {
      applyServerErrors(error, {
        setError: (field, err) => form.setError(field as keyof ProductFormInput, err),
        knownFields: [...KNOWN_FIELDS],
      })
    }
  })

  const brands = brandsQuery.data ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualizá los datos del producto.'
              : 'Agrega un producto al catálogo.'}
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
                          .filter((b) => b.isActive || b.id === product?.brandId)
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <FormControl>
                      <Input
                        disabled={pending}
                        placeholder="Collares, Correas, etc."
                        {...field}
                      />
                    </FormControl>
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
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Si tiene variantes, el stock real vive en cada variante.
                    </FormDescription>
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

              <FormField
                control={form.control}
                name="hasVariants"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Tiene variantes</FormLabel>
                      <FormDescription className="text-xs">
                        Color, talla, diseño, etc.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={pending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canBePersonalized"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Personalizable</FormLabel>
                      <FormDescription className="text-xs">
                        Permite mensaje o nombre.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={pending}
                      />
                    </FormControl>
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
                        <FormLabel>Producto activo</FormLabel>
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
                {isEdit ? 'Guardar cambios' : 'Crear producto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
