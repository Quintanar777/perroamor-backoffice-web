import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api/client'
import { ApiError, type PagedResponse } from '@/lib/types/api'
import type {
  AppEvent,
  EventFilters,
  EventInput,
} from '@/lib/types/event'

export const eventsApi = {
  list: (filters: EventFilters = {}): Promise<PagedResponse<AppEvent>> =>
    apiGet<PagedResponse<AppEvent>>('/events', {
      query: filters as Record<string, unknown>,
    }),
  get: (id: number): Promise<AppEvent> => apiGet<AppEvent>(`/events/${id}`),
  current: async (): Promise<AppEvent | null> => {
    try {
      return await apiGet<AppEvent>('/events/current')
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null
      throw err
    }
  },
  create: (body: EventInput): Promise<AppEvent> => apiPost<AppEvent>('/events', body),
  update: (id: number, body: EventInput): Promise<AppEvent> =>
    apiPut<AppEvent>(`/events/${id}`, body),
  remove: (id: number): Promise<void> => apiDelete<void>(`/events/${id}`),
}

export const eventsKeys = {
  list: (filters: EventFilters = {}) => ['events', 'list', filters] as const,
  detail: (id: number) => ['events', 'detail', id] as const,
  current: () => ['events', 'current'] as const,
}
