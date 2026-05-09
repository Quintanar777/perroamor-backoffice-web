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
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  brandSchema,
  type BrandFormInput,
} from '@/features/catalog/schemas/brandSchema'
import { useCreateBrand, useUpdateBrand } from '@/features/catalog/hooks/useBrands'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import type { Brand } from '@/lib/types/catalog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand: Brand | null
}

const KNOWN_FIELDS = ['name', 'description', 'isActive'] as const

export function BrandFormDialog({ open, onOpenChange, brand }: Props) {
  const isEdit = brand !== null
  const create = useCreateBrand()
  const update = useUpdateBrand()
  const pending = create.isPending || update.isPending

  const form = useForm<BrandFormInput>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: '', description: '', isActive: true },
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      brand
        ? {
            name: brand.name,
            description: brand.description ?? '',
            isActive: brand.isActive,
          }
        : { name: '', description: '', isActive: true },
    )
    // intentional: same defaults shape; reset triggered by `open` toggle
  }, [brand, open, form])

  const onSubmit = form.handleSubmit(async (values) => {
    const description = values.description.trim()
    const body = {
      name: values.name.trim(),
      description: description.length > 0 ? description : null,
      isActive: values.isActive,
    }
    try {
      if (brand) {
        await update.mutateAsync({ id: brand.id, body })
      } else {
        await create.mutateAsync(body)
      }
      onOpenChange(false)
    } catch (error) {
      applyServerErrors(error, {
        setError: (field, err) => form.setError(field as keyof BrandFormInput, err),
        knownFields: [...KNOWN_FIELDS],
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar marca' : 'Nueva marca'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualizá los datos de la marca.'
              : 'Creá una nueva marca para el catálogo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
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
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input
                      disabled={pending}
                      placeholder="Opcional"
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
                  <FormItem>
                    <Label>Estado</Label>
                    <ToggleGroup
                      type="single"
                      value={field.value ? 'active' : 'inactive'}
                      onValueChange={(v) => v && field.onChange(v === 'active')}
                      disabled={pending}
                      className="justify-start"
                    >
                      <ToggleGroupItem value="active">Activa</ToggleGroupItem>
                      <ToggleGroupItem value="inactive">Inactiva</ToggleGroupItem>
                    </ToggleGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {isEdit ? 'Guardar cambios' : 'Crear marca'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
