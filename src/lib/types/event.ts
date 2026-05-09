export type EventStatus = 'UPCOMING' | 'IN_PROGRESS' | 'FINISHED'

export interface AppEvent {
  id: number
  name: string
  location: string
  description: string | null
  startDate: string
  endDate: string
  isActive: boolean
  status: EventStatus
  durationDays: number
  createdAt: string
}

export interface EventInput {
  name: string
  location: string
  description?: string | null
  startDate: string
  endDate: string
}

export interface EventFilters {
  page?: number
  size?: number
  status?: EventStatus
  isActive?: boolean
}
