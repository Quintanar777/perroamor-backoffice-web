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
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/shared/DatePicker'
import {
  useCreateEvent,
  useUpdateEvent,
} from '@/features/events/hooks/useEvents'
import {
  eventSchema,
  type EventFormInput,
} from '@/features/events/schemas/eventSchema'
import { applyServerErrors } from '@/lib/forms/applyServerErrors'
import type { AppEvent } from '@/lib/types/event'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: AppEvent | null
}

const KNOWN_FIELDS = [
  'name',
  'location',
  'description',
  'startDate',
  'endDate',
] as const

const emptyDefaults: EventFormInput = {
  name: '',
  location: '',
  description: '',
  startDate: '',
  endDate: '',
}

export function EventFormDialog({ open, onOpenChange, event }: Props) {
  const isEdit = event !== null
  const create = useCreateEvent()
  const update = useUpdateEvent()
  const pending = create.isPending || update.isPending

  const form = useForm<EventFormInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: emptyDefaults,
  })

  useEffect(() => {
    if (!open) return
    form.reset(
      event
        ? {
            name: event.name,
            location: event.location,
            description: event.description ?? '',
            startDate: event.startDate,
            endDate: event.endDate,
          }
        : emptyDefaults,
    )
  }, [event, open, form])

  const onSubmit = form.handleSubmit(async (values) => {
    const description = values.description.trim()
    const body = {
      name: values.name.trim(),
      location: values.location.trim(),
      description: description.length > 0 ? description : null,
      startDate: values.startDate,
      endDate: values.endDate,
    }
    try {
      if (event) {
        await update.mutateAsync({ id: event.id, body })
      } else {
        await create.mutateAsync(body)
      }
      onOpenChange(false)
    } catch (error) {
      applyServerErrors(error, {
        setError: (field, err) => form.setError(field as keyof EventFormInput, err),
        knownFields: [...KNOWN_FIELDS],
      })
    }
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
          <DialogDescription>
            Carga un evento para asociarle ventas.
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lugar</FormLabel>
                  <FormControl>
                    <Input
                      disabled={pending}
                      placeholder="Centro de Convenciones, CDMX"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inicio</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={pending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fin</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={pending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={pending}
                      rows={3}
                      placeholder="Opcional"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                {isEdit ? 'Guardar cambios' : 'Crear evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
