import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { eventsApi, eventsKeys } from '@/lib/api/events'
import type { AppEvent, EventFilters, EventInput } from '@/lib/types/event'

export function useEventsQuery(filters: EventFilters) {
  return useQuery({
    queryKey: eventsKeys.list(filters),
    queryFn: () => eventsApi.list(filters),
    placeholderData: keepPreviousData,
  })
}

export function useCurrentEventQuery() {
  return useQuery({
    queryKey: eventsKeys.current(),
    queryFn: eventsApi.current,
    staleTime: 60_000,
  })
}

const invalidateEvents = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['events'] })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: EventInput) => eventsApi.create(body),
    onSuccess: (event) => {
      invalidateEvents(qc)
      toast.success('Evento creado', { description: event.name })
    },
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: EventInput }) =>
      eventsApi.update(id, body),
    onSuccess: (event) => {
      invalidateEvents(qc)
      toast.success('Evento actualizado', { description: event.name })
    },
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (event: AppEvent) => eventsApi.remove(event.id),
    onSuccess: (_, event) => {
      invalidateEvents(qc)
      toast.success('Evento eliminado', { description: event.name })
    },
  })
}
